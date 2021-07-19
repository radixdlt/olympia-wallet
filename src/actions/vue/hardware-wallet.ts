export const sendAPDU = (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: readonly number[]) =>
  window.ipcRenderer.invoke('send-apdu', { cla, ins, p1, p2, data: data?.toString('hex') })
