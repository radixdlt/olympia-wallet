import path from 'path'
import { dialog, MessageBoxReturnValue } from 'electron'
import { autoUpdater } from 'electron-updater'
import { setUpdateIsAvailable } from '@/actions/electron/general'

autoUpdater.autoDownload = false
if (process.env.WEBPACK_DEV_SERVER_URL) {
  autoUpdater.updateConfigPath = path.join(
    __dirname,
    '../dev-app-update.yml'
  )
}

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  setUpdateIsAvailable(true)
})

autoUpdater.on('update-not-available', () => {
  setUpdateIsAvailable(false)
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will restart to update.'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

export const downloadUpdate = (): void => {
  autoUpdater.downloadUpdate()
}

export const checkForUpdates = (): void => {
  autoUpdater.checkForUpdates()
}
