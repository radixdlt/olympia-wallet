const { promisify } = require('util')
const { execFile } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs/promises')

const execFileAsync = promisify(execFile)

async function run(command, args, options = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      maxBuffer: 10 * 1024 * 1024,
      ...options
    })

    if (stdout) {
      console.log(stdout)
    }
    if (stderr) {
      console.error(stderr)
    }
  } catch (error) {
    console.error(`Command failed: ${command} ${args.join(' ')}`)
    if (error.stdout) {
      console.error(error.stdout)
    }
    if (error.stderr) {
      console.error(error.stderr)
    }
    throw error
  }
}

exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appleId = process.env.APPLE_ID
  const appleIdPassword = process.env.APPLE_ID_PASSWORD
  const teamId = process.env.APPLE_TEAM_ID

  if (!appleId || !appleIdPassword || !teamId) {
    console.warn('Skipping notarization: missing APPLE_ID / APPLE_ID_PASSWORD / APPLE_TEAM_ID environment variables')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'radix-notarize-'))
  const zipPath = path.join(tempDir, `${path.basename(appPath, '.app')}.zip`)

  try {
    console.log(`Notarizing ${appPath} with notarytool`)
    await run('ditto', ['-c', '-k', '--keepParent', appPath, zipPath])

    const submitArgs = [
      'notarytool',
      'submit',
      zipPath,
      '--apple-id',
      appleId,
      '--password',
      appleIdPassword,
      '--team-id',
      teamId,
      '--wait'
    ]

    await run('xcrun', submitArgs)
    await run('xcrun', ['stapler', 'staple', appPath])
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}
