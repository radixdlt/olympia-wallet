import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main'
import { clipboard } from 'electron'
import crypto from 'crypto'
import { store } from '@/actions/electron/data-store'
import { BasicLedgerTransport } from '@radixdlt/hardware-ledger'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

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

const basicLedgerTransportPromise: Promise<BasicLedgerTransport> = TransportNodeHid.create()

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  const transport = await basicLedgerTransportPromise
  const result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
  return result
}
