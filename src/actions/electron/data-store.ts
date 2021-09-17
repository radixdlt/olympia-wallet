import { IpcMainInvokeEvent } from 'electron/main'
import Store from 'electron-store'
import migrations from '@/electron-store/migrations'

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

export const getDerivedAccountsIndex = (event: IpcMainInvokeEvent, network: string) => {
  return store.get(`wallets.${network}.derivedAccountsIndex`)
}

export const saveHardwareAddress = (event: IpcMainInvokeEvent, data: string) => {
  const { address, network } = JSON.parse(data)
  return store.set(`wallets.${network}.hardwareAddress`, address)
}

export const getHardwareAddress = (event: IpcMainInvokeEvent, network: string) => {
  return store.get(`wallets.${network}.hardwareAddress`)
}

export const deleteHardwareAddress = (event: IpcMainInvokeEvent, network: string) => {
  return store.delete(`wallets.${network}.hardwareAddress`)
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
