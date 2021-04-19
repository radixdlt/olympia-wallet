export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const getAccountName = (accountAddress: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-name', accountAddress))
})
