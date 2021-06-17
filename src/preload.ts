// import { contextBridge, ipcRenderer, IpcRenderer } from 'electron'
// declare global {
//   interface Window {
//     ipcRenderer: IpcRenderer;
//   }
// }

// // Expose ipcRenderer methods to render thread
// contextBridge.exposeInMainWorld('ipcRenderer', {
//   send: (channel: string, data: string[]) => {
//     ipcRenderer.send(channel, data)
//   },
//   invoke: (channel: string, args: string[]) =>
//     ipcRenderer.invoke(channel, args)
// })

const _process = process

console.log('PROCESS', _process)

process.once('loaded', function() {
  global.process = _process
  global.require = require
  global.Buffer = Buffer
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'