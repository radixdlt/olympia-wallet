import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

let performingInstruction = false

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  const devices = await TransportNodeHid.list()
  if (!devices[0]) { throw new Error('No device found.') }

  
  const transport = await TransportNodeHid.create()
  performingInstruction = true

  let result

  try {
    result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
  } catch (e) {
    performingInstruction = false
    transport.close()
    throw e
  }

  performingInstruction = false
  transport.close()

  return result
}
