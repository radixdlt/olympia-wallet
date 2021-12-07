import { AccountName, SelectedNode } from '../electron/data-store'
import { Network, ResourceIdentifierT } from '@radixdlt/application'
export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const getLatestAccountAddress = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-latest-account-address', String(network)))
})

export const saveLatestAccountAddress = (address: string, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-latest-account-address', JSON.stringify({ address, network })))
})

export const getAccountNames = (): Promise<AccountName[]> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-names'))
})

export const saveDerivedAccountsIndex = (num: number, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-num-accounts', JSON.stringify({ num, network })))
})

export const getDerivedAccountsIndex = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-num-accounts', String(network)))
})

export const saveHardwareWalletAddress = (address: string, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-hw-address', JSON.stringify({ address, network })))
})

export const getHardwareWalletAddress = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-hw-address', String(network)))
})

export const deleteHardwareWalletAddress = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('delete-hw-address', String(network)))
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

export const persistCustomNodeURL = async (nodeURL: string): Promise<void> => {
  const data = await window.ipcRenderer.invoke('persist-custom-node-url', nodeURL)
  return data
}

export const fetchCustomNodeURLs = async (): Promise<string[]> => {
  const data = await window.ipcRenderer.invoke('fetch-custom-node-urls') as string[]
  return data
}

export const forgetCustomNodeURL = async (nodeURL: string): Promise<void> => {
  await window.ipcRenderer.invoke('forget-custom-node-url', nodeURL)
}

export const hideTokenType = async (tokenRRI: ResourceIdentifierT): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('hide-token-type', tokenRRI.toString())
  return newHiddenTokens
}

export const unhideTokenType = async (tokenRRI: string): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('unhide-token-type', tokenRRI.toString())
  return newHiddenTokens
}

export const getHiddenTokens = async (): Promise<string[]> => {
  const data = await window.ipcRenderer.invoke('get-hidden-tokens')
  return data
}

export const getAcceptedTos = (): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-accepted-tos'))
})

export const setAcceptedTos = (value: boolean): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('set-accepted-tos', value))
})
