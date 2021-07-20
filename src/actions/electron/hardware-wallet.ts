import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  const transport = await TransportNodeHid.create()
  const result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
  transport.close()
  return result
}