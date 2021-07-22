import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { IpcMainInvokeEvent } from 'electron/main'
import { Observable, Subject } from 'rxjs'
import { RadixAPDU } from '@radixdlt/hardware-ledger'

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
    throw e
  }

  performingInstruction = false
  transport.close()

  return result
}

const subscribeDeviceConnection = async (next: (isConnected: boolean) => any) =>
  TransportNodeHid.listen({
    next: async (obj: any) => {
      switch (obj.type) {
        case 'add':
          next(true)
          break
        case 'remove':
          next(false)
          break
      }
    },
  } as any)

export enum ConnectionEvent {
  DEVICE_CONNECTED,
  DEVICE_DISCONNECTED,
  APP_OPEN,
  APP_CLOSED
}

export enum AppState {
  APP_OPEN,
  APP_CLOSED
}

const appStateObservable = new Observable<AppState>(subscriber => {
  let connected = false
  setInterval(async () => {
    if (performingInstruction) { return }
    try {
      const apdu = await RadixAPDU.getVersion()

      // @ts-ignore
      await sendAPDU(undefined, apdu)
      if (connected) { return }
    } catch (e) {
      if (!connected) { return }
    }
    connected = !connected
    subscriber.next(connected ? AppState.APP_OPEN : AppState.APP_CLOSED)
  }, 500)
})

const appStateSubject = new Subject<AppState>()
appStateObservable.subscribe(appStateSubject)

export const subscribeAppConnection = appStateSubject.subscribe.bind(appStateSubject)

export async function subscribeConnection(next: (value: ConnectionEvent) => void) {
  let deviceConnected = false
  let lastResult: ConnectionEvent

  const deviceSubscription = await subscribeDeviceConnection(isConnected => {
    deviceConnected = isConnected

    // If the radix app is opened/closed, this will trigger device disconnected
    // and then connected. To ignore that (to help the UI make sense), wait a bit
    // for an event following immediately, and only signal if there was none. 
    setTimeout(() => {
      if (deviceConnected == isConnected) {
        const result = isConnected ? ConnectionEvent.DEVICE_CONNECTED : ConnectionEvent.DEVICE_DISCONNECTED
        if(lastResult === result) return

        lastResult = result
        next(result)
      }
    }, 3000)
  })

  const appSubscription = subscribeAppConnection(state => {
    next((() => {
      switch (state) {
        case AppState.APP_OPEN:
          return ConnectionEvent.APP_OPEN
        case AppState.APP_CLOSED:
          return ConnectionEvent.APP_CLOSED
      }
    })())
  })

  return {
    unsubscribe: () => {
      appSubscription.unsubscribe()
      deviceSubscription.unsubscribe()
    },
  }
}

subscribeConnection(event => {
  switch (event) {
    case ConnectionEvent.APP_OPEN:
      console.log('ledger app is open')
      break
    case ConnectionEvent.APP_CLOSED:
      console.log('ledger app is closed')
      break
    case ConnectionEvent.DEVICE_CONNECTED:
      console.log('device connected')
      break
    case ConnectionEvent.DEVICE_DISCONNECTED:
      console.log('device disconnected')
      break
  }
})