import Store from 'electron-store'
Store.initRenderer()

export const store = new Store({
  name: 'wallet'
})

export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  return store.set(`account.${accountAddress}`, prettyName)
})

export const getAccountName = (accountAddress: string): Promise<string> => new Promise((resolve) => {
  return store.get(`account.${accountAddress}`)
})

export const saveDerivedAccountsIndex = (numAccounts: number): Promise<string> => new Promise((resolve) => {
  return store.set('derivedAccountsIndex', numAccounts)
})

export const getDerivedAccountsIndex = (): Promise<string> => new Promise((resolve) => {
  return store.get('derivedAccountsIndex')
})
