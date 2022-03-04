import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { ipcMain } from 'electron'
import { IpcMainInvokeEvent } from 'electron/main'
import { setLedgerConnectionStatus } from '../vue/hardware-wallet'

export const sendAPDU = async (event: IpcMainInvokeEvent, apdu: { cla: number, ins: number, p1: number, p2: number, data?: string }) => {
  console.log('sendapdu')
  const paths = await TransportNodeHid.list()
  if (paths.length === 0) throw Error('No device found.')

  const device = await TransportNodeHid.open(paths[0])

  let result
  try {
    result = await device.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data ? Buffer.from(apdu.data, 'hex') : undefined)
  } catch (e) {
    await device.close()
    throw e
  }

  await device.close()

  return result
}

export const listenForLedger = (args: any) => {
  // console.log('****************** got args', args)

  // const sub = TransportNodeHid.listen(args)
  // console.log('****************** sub in electron', sub)
  // return Promise.resolve(sub)

  // window.ipcRenderer.subscribe()
  const res = TransportNodeHid.listen({
    next: async (obj: any) => {
      switch (obj.type) {
        case 'add':
          console.log('good')
          setLedgerConnectionStatus('bueno')
          break
        case 'remove':
          console.log('bad')
          setLedgerConnectionStatus('malo')
          break
      }
    }
  } as any)
  console.log('#### RES', res)
}

// I think i'm going to need to create a ledger module and store some local state in there and put all of the subs in there
// listening from the app won't be reactive 