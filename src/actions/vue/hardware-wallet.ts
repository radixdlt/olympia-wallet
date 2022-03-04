import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { RadixAPDUT } from '@radixdlt/hardware-ledger'

export const sendAPDU = (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: readonly number[]) =>
  window.ipcRenderer.invoke('send-apdu', { cla, ins, p1, p2, data: data?.toString('hex') })

export const checkLedgerConnection = (apdu: RadixAPDUT) =>
  window.ipcRenderer.invoke('send-apdu', {
    cla: apdu.cla,
    ins: apdu.ins,
    p1: apdu.p1,
    p2: apdu.p2,
    data: apdu.data?.toString('hex')
  })

export const listenForLedger = (args: any) => {
  return window.ipcRenderer.invoke('listen-for-ledger')
}

export const setLedgerConnectionStatus = (status: string) => {
  console.log('setting status', status)
  // need a way to broadcast this to the vue app
}
