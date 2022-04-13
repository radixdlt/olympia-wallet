import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  const paths = await TransportNodeHid.list()
  if (paths.length === 0) throw Error('No device found.')

  const transport = await TransportNodeHid.open(paths[0])
  let result
  try {
    result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
  } catch (e) {
    await transport.close()
    throw e
  }

  await transport.close()

  return result
}
