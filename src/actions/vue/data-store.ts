import { AccountName, SelectedNode } from '../electron/data-store'

export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const getAccountNames = (): Promise<AccountName[]> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-names'))
})

export const saveDerivedAccountsIndex = (numAccounts: number): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-num-accounts', String(numAccounts)))
})

export const getDerivedAccountsIndex = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-num-accounts'))
})

export const saveHardwareWalletAddress = (address: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-hw-address', address))
})

export const getHardwareWalletAddress = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-hw-address'))
})

export const deleteHardwareWalletAddress = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('delete-hw-address'))
})

export const resetStore = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('reset-store'))
})

export const persistNodeSelection = (nodeUrl: string, hash: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('persist-node-selection', JSON.stringify({ nodeUrl, hash })))
})

export const fetchSelectedNodeFromStore = async (): Promise<SelectedNode> => {
  const data = await window.ipcRenderer.invoke('fetch-selected-node') as SelectedNode
  return data
}
