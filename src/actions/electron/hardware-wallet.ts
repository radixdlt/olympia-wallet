import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'

type APDU = { cla: number, ins: number, p1: number, p2: number, data?: string }
let lastAPDU: APDU | null = null 

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: APDU) => {
  const paths = await TransportNodeHid.list()
  if (paths.length === 0) throw Error('No device found.')
  if (paths.length > 1) throw Error('Too Many Devices Enabled')
  if (lastAPDU && lastAPDU === apdu) {
    console.warn('duplicate message', apdu)
    return
  }
  let result
  try {
    const transport = await TransportNodeHid.open(paths[0])
    result = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
    lastAPDU = apdu
    await transport.close()
  } catch (e) {
    console.log('hi there', e)
    throw e
  }

  return result
}
