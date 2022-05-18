import path from 'path'
import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { setUpdateIsAvailable, setUpdateIsDownloaded } from '@/actions/electron/general'

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
  setUpdateIsDownloaded(true)
})

export const quitAndInstall = (): void => {
  autoUpdater.quitAndInstall()
}

export const downloadUpdate = (): void => {
  autoUpdater.downloadUpdate()
}

export const checkForUpdates = (): void => {
  autoUpdater.checkForUpdates()
}
