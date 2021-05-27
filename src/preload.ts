import { contextBridge, ipcRenderer, IpcRenderer } from 'electron'
const _process = process

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

// Expose ipcRenderer methods to render thread
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data: string[]) => {
    ipcRenderer.send(channel, data)
  },
  invoke: (channel: string, args: string[]) =>
    ipcRenderer.invoke(channel, args)
})

contextBridge.exposeInMainWorld('process', {
  process: _process
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
