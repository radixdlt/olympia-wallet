import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main'
import { clipboard } from 'electron'
import Store from 'electron-store'
import crypto from 'crypto'

const store = new Store({
  name: 'wallet'
})

export const writeKeystoreFile = (event: IpcMainEvent, encodedWallet: string) => {
  store.set('seed', encodedWallet)
}

export const getKeystoreFile = () => {
  return store.get('seed')
}

export const storePin = (event: IpcMainInvokeEvent, pin: string) =>
  digestPin(pin).then((hash: string) => { store.set('pin', hash) })

export const copyToClipboard = (event: IpcMainEvent, text: string) => {
  clipboard.writeText(text, 'selection')
}

const digestPin = async (pin: string) => 
  crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex')