export const refreshApp = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('refresh-app'))
})

export const getVersionNumber = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-version-number'))
})
