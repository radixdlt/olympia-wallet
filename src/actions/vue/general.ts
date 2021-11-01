export const refreshApp = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('refresh-app'))
})
