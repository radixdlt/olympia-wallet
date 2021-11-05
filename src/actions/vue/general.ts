export const refreshApp = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('refresh-app'))
})

export const getVersionNumber = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-version-number'))
})

export const downloadLatestVersion = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('download-latest-version'))
})

export const getIsUpdateAvailable = (): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-is-update-available'))
})
