import { IpcMainInvokeEvent } from 'electron/main'
import Store from 'electron-store'

export const store = new Store({
  name: 'wallet'
})

export const saveAccountName = (event: IpcMainInvokeEvent, data: string) => {
  const { accountAddress, prettyName } = JSON.parse(data)
  return store.set(`account.${accountAddress}`, prettyName)
}

export const getAccountName = (event: IpcMainInvokeEvent, accountAddress: string) => {
  return store.get(`account.${accountAddress}`)
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
