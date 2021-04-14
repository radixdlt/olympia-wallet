
export const storePin = (pin: string, passcode: string) => {
  const data = { pin: pin, passcode: passcode }
  window.ipcRenderer.send('create-pin', JSON.stringify(data))
}
