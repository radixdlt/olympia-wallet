import { IpcMainInvokeEvent } from 'electron/main'
import Store from 'electron-store'
import migrations from '@/electron-store/migrations'
import { HardwareDevice } from '@/services/_types'

type MaybeString = string | null;
export type AccountName = { address: string; name: string; }
export type SelectedNode = { selectedNode: MaybeString; selectedNodeHash: MaybeString; }

export const store = new Store({
  name: 'wallet',
  migrations
})

export const saveAccountName = (event: IpcMainInvokeEvent, data: string) => {
  const { accountAddress, prettyName } = JSON.parse(data)
  return store.set(`account.${accountAddress}`, prettyName)
}

export const saveDeviceName = (event: IpcMainInvokeEvent, data: string) => {
  const { network, deviceIndex, prettyName } = JSON.parse(data)
  let hardwareDevices = store.get(`wallets.${network}.hardwareDevices`) as HardwareDevice[]
  const device = hardwareDevices[deviceIndex]
  const renamedDeviceObject = {"name": prettyName, "addresses":[...device.addresses]}
  hardwareDevices.splice(deviceIndex, 1, renamedDeviceObject)
  store.set(`wallets.${network}.hardwareDevices`, hardwareDevices)
}

export const getLatestAccountAddress = (event: IpcMainInvokeEvent, network: string): string => {
  return store.get(`wallets.${network}.latestAddress`, '') as string
}

export const saveLatestAccountAddress = (event: IpcMainInvokeEvent, data: string) => {
  const { address, network } = JSON.parse(data)
  return store.set(`wallets.${network}.latestAddress`, address)
}

export const getAccountNames = (): AccountName[] => {
  const accounts = store.get('account', {}) as { [key: string]: string; }
  const asAccounts: AccountName[] = []
  Object.keys(accounts).forEach((key) => {
    asAccounts.push({ address: key, name: accounts[key] })
  })
  return asAccounts
}

export const saveDerivedAccountsIndex = (event: IpcMainInvokeEvent, data: string): void => {
  const { num, network } = JSON.parse(data)
  store.set(`wallets.${network}.derivedAccountsIndex`, num)
}

export const saveDerivedHardwareAccountsIndex = (event: IpcMainInvokeEvent, data: string): void => {
  const { num, network, deviceId } = JSON.parse(data) // instead of num, need this to be the new account address
  const devices: any = store.get(`wallets.${network}.hardwareDevices`, []) 
  
  // deviceId should be the new account address
  const newAddressStruct = {'name': deviceId, 'account': deviceId}  
  
  // copy/destructure existing hardwareDevices struct and append new address to end
  const newAddresses = [{'name': deviceId, addresses: [...devices[0].addresses, newAddressStruct]}] 
  store.set(`wallets.${network}.hardwareDevices`, newAddresses)
}

export const getDerivedAccountsIndex = (event: IpcMainInvokeEvent, network: string) => {
  return store.get(`wallets.${network}.derivedAccountsIndex`)
}

export const saveHardwareDevices = (event: IpcMainInvokeEvent, data: string): void => {
  const { network, encodedDevices } = JSON.parse(data)
  store.set(`wallets.${network}.hardwareDevices`, encodedDevices)
}

export const getHardwareDevices = (event: IpcMainInvokeEvent, network: string) : HardwareDevice[] => {
  return store.get(`wallets.${network}.hardwareDevices`) as HardwareDevice[]
}

export const getHardwareDeviceAccounts = (event: IpcMainInvokeEvent, network: string, deviceId: string) => {
  const hardwareStoreList: any = store.get(`wallets.${network}.hardwareDevices`)
  return hardwareStoreList
}

export const resetStore = (event: IpcMainInvokeEvent) => {
  return store.clear()
}

export const persistNodeSelection = (event: IpcMainInvokeEvent, data: string): void => {
  const { nodeUrl, hash } = JSON.parse(data)
  store.set('selectedNode', nodeUrl)
  store.set('selectedNodeHash', hash)
}

export const fetchSelectedNode = (): SelectedNode => {
  const selectedNode = store.get('selectedNode', null) as MaybeString
  const selectedNodeHash = store.get('selectedNodeHash', null) as MaybeString
  return { selectedNode, selectedNodeHash }
}

export const persistCustomNodeURL = (event: IpcMainInvokeEvent, data: string): void => {
  const currentURLs = store.get('customNodes', []) as string[]
  currentURLs.push(data)
  store.set('customNodes', currentURLs)
}

export const fetchCustomNodeURLs = (): string[] => {
  return store.get('customNodes', []) as string[]
}

export const forgetCustomNodeURL = (event: IpcMainInvokeEvent, nodeURL: string): void => {
  let urls = store.get('customNodes', []) as string[]
  urls = urls.filter((val) => val !== nodeURL)
  store.set('customNodes', urls)
}

export const hideTokenType = (event: IpcMainInvokeEvent, tokenRRI: string): string[] => {
  const hiddenTokens = store.get('hiddenTokens', []) as string[]
  store.set('hiddenTokens', [...hiddenTokens, tokenRRI])
  return [...hiddenTokens, tokenRRI]
}

export const unhideTokenType = (event: IpcMainInvokeEvent, tokenRRI: string): string[] => {
  let hiddenTokens = store.get('hiddenTokens', []) as string[]
  hiddenTokens = hiddenTokens.filter((t: string) => t !== tokenRRI)
  store.set('hiddenTokens', hiddenTokens)
  return hiddenTokens
}

export const getAcceptedTos = (): boolean => {
  return store.get('acceptedTos', false) as boolean
}

export const setAcceptedTos = (event: IpcMainInvokeEvent, value: boolean): void => {
  store.set('acceptedTos', value)
}

export const getHiddenTokens = (): string[] => {
  const hiddenTokens = store.get('hiddenTokens', []) as string[]
  return hiddenTokens
}

export const getHiddenAccounts = (): string[] => {
  const hiddenAccounts = store.get('hiddenAccounts', []) as string[]
  return hiddenAccounts
}

export const hideAccount = (event: IpcMainInvokeEvent, accountAddress: string): string[] => {
  const hiddenAccounts = store.get('hiddenAccounts', []) as string[]
  store.set('hiddenAccounts', [...hiddenAccounts, accountAddress])
  return [...hiddenAccounts, accountAddress]
}

export const unhideAccount = (event: IpcMainInvokeEvent, accountAddress: string): string[] => {
  let hiddenAccounts = store.get('hiddenAccounts', []) as string[]
  hiddenAccounts = hiddenAccounts.filter((t: string) => t !== accountAddress)
  store.set('hiddenAccounts', hiddenAccounts)
  return hiddenAccounts
}
