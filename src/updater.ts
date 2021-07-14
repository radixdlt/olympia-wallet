import { dialog, MessageBoxReturnValue, MenuItem } from 'electron'
import { autoUpdater } from 'electron-updater'

let updater: MenuItem | null
autoUpdater.autoDownload = false

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }).then((buttonIndex: MessageBoxReturnValue) => {
    if (buttonIndex.response === 0) {
      autoUpdater.downloadUpdate()
    } else {
      if (updater) updater.enabled = true
      updater = null
    }
  })
})

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  })
  if (updater) updater.enabled = true
  updater = null
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application quit for update...'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

// export this to MenuItem click callback
function checkForUpdates (menuItem: MenuItem): void {
  updater = menuItem
  updater.enabled = false
  autoUpdater.checkForUpdates()
}
export default checkForUpdates
