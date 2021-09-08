import { IpcMainInvokeEvent } from 'electron/main'
import Store from 'electron-store'

export type AccountName = { address: string; name: string; }

export const store = new Store({
  name: 'wallet'
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

export const saveDerivedAccountsIndex = (event: IpcMainInvokeEvent, num: string) => {
  return store.set('derivedAccountsIndex', num)
}

export const getDerivedAccountsIndex = (event: IpcMainInvokeEvent) => {
  return store.get('derivedAccountsIndex')
}

export const saveHardwareAddress = (event: IpcMainInvokeEvent, address: string) => {
  return store.set('hardwareAddress', address)
}

export const getHardwareAddress = (event: IpcMainInvokeEvent) => {
  return store.get('hardwareAddress')
}

export const deleteHardwareAddress = (event: IpcMainInvokeEvent) => {
  return store.delete('hardwareAddress')
}

export const resetStore = (event: IpcMainInvokeEvent) => {
  return store.clear()
}
