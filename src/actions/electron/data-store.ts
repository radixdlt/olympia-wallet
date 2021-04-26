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
