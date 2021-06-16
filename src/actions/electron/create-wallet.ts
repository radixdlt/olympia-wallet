import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main'
import { clipboard } from 'electron'
import crypto from 'crypto'
import { store } from '@/actions/electron/data-store'
import { BasicLedgerTransport, HardwareWalletLedger } from '@radixdlt/hardware-ledger'
// @ts-ignore
import TransportNodeHid from '@aleworm/hw-transport-node-hid'

import {
  HDPathRadix,
  NetworkT,
  Radix, RadixT,
} from '@radixdlt/application'
import { map, mergeMap, tap } from 'rxjs/operators'

export const writeKeystoreFile = (event: IpcMainInvokeEvent, encodedWallet: string) => store.set('seed', encodedWallet)

export const getKeystoreFile = () => store.get('seed')

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

let radix: RadixT

export const login = (event: IpcMainInvokeEvent, password: string) => {
  radix = Radix
    .create()
    .connect('https://betanet.radixdlt.com/rpc')
    .login(password,
      () => new Promise(resolve => {
        resolve(JSON.parse(getKeystoreFile() as string))
      })
    )
}

/*
export const deriveHWAccount = (event: IpcMainInvokeEvent) => {
  radix.deriveHWAccount({
    keyDerivation: 'next',
    hardwareWalletConnection: HardwareWalletLedger.create()
  }).subscribe((hwAccount: any) => {
    console.log('got hw account: ', hwAccount.address.toString())
  })
}*/

/*
const hwWallet = HardwareWalletLedger.create()


export type getPublicKeyInput = {
  path?: string,
  requireConfirmationOnDevice?: boolean,
  verifyAddressOnDeviceForNetwork?: NetworkT
}

export const getPublicKey = (event: IpcMainInvokeEvent, rawInput: getPublicKeyInput): Promise<Buffer> => new Promise(resolve => {
  const input = {
    path: rawInput.path ? HDPathRadix.fromString(rawInput.path)._unsafeUnwrap() : undefined,
    requireConfirmationOnDevice: rawInput.requireConfirmationOnDevice,
    verifyAddressOnDeviceForNetwork: rawInput.verifyAddressOnDeviceForNetwork
  }

  hwWallet.pipe(
    mergeMap(wallet => wallet.getPublicKey(input)),
    tap(pubKey => resolve(pubKey.asData({ compressed: false })))
  )
})
*/

const basicLedgerTransport: BasicLedgerTransport = TransportNodeHid.create()

export const sendAPDU = (event: IpcMainInvokeEvent, cla: number, ins: number, p1: number, p2: number, data?: Buffer) => {
  console.log('basicLedgerTransport: ', basicLedgerTransport)
  return basicLedgerTransport.send(cla, ins, p1, p2, data)
}
