export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const getAccountName = (accountAddress: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-name', accountAddress))
})

export const saveDerivedAccountsIndex = (numAccounts: number): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-num-accounts', String(numAccounts)))
})

export const getDerivedAccountsIndex = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-num-accounts'))
})
