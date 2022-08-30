import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

type APDU = { cla: number, ins: number, p1: number, p2: number, data?: string }

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: APDU) => {
  const paths = await TransportNodeHid.list()
  if (paths.length === 0) throw Error('No device found.')
  if (paths.length > 1) throw Error('Too Many Devices Enabled')
  let result
  const transport = await TransportNodeHid.open(paths[0])
  try {
    result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
    await transport.close()
  } catch (e) {
    await transport.close()
    console.error(e)
    throw e
  }
  await transport.close()
  return result
}
