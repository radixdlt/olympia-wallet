import { AccountName, SelectedNode } from '../electron/data-store'
import { Network } from '@radixdlt/application'
export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const getAccountNames = (): Promise<AccountName[]> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-names'))
})

export const saveDerivedAccountsIndex = (num: number, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-num-accounts', JSON.stringify({ num, network })))
})

export const getDerivedAccountsIndex = (network: Network): Promise<string> => new Promise((resolve) => {
  console.log(network)
  resolve(window.ipcRenderer.invoke('get-num-accounts', String(network)))
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
