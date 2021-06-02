import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main'
import { clipboard } from 'electron'
import crypto from 'crypto'
import { store } from '@/actions/electron/data-store'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'

import {
  Radix,
} from '@radixdlt/application'

export const writeKeystoreFile = (event: IpcMainInvokeEvent, encodedWallet: string) => {
  return store.set('seed', encodedWallet)
}

export const getKeystoreFile = () => {
  return store.get('seed')
}

const digestPin = async (pin: string) =>
  crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex')

export const storePin = (event: IpcMainInvokeEvent, pin: string) =>
  digestPin(pin).then((hash: string) => { store.set('pin', hash) })

export const copyToClipboard = (event: IpcMainEvent, text: string) => {
  clipboard.writeText(text)
}

export const validatePin = (event: IpcMainInvokeEvent, pin: string) =>
  digestPin(pin).then((inputHash: string) => store.get('pin') === inputHash)

export const deriveHWAccount = (event: IpcMainInvokeEvent) => {
  const radix = Radix
    .create()
    .connect('https://betanet.radixdlt.com/rpc')

  radix.deriveHWAccount({
    keyDerivation: 'next',
    hardwareWalletConnection: HardwareWalletLedger.create()
  }).subscribe((hwAccount: any) => {
    console.log('got hw account: ', hwAccount.address.toString())
  })
}
