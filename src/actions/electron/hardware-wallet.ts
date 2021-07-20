import {  Device } from '@radixdlt/hardware-ledger'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  const device = await openConnection()
  return await device.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
}

const openConnection = async (): Promise<Device> => {
  const devices = await TransportNodeHid.list()

  if (!devices[0]) { throw new Error('No device found.') }
  return TransportNodeHid.open(devices[0]) as any
}
