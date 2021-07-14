import { MnemomicT, Wallet, WalletT, KeystoreT, Network, SigningKeychain } from '@radixdlt/application'

export const initWallet = async (mnemonic: MnemomicT, passcode: string, network: Network): Promise<WalletT> => {
  const walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
    mnemonic,
    password: passcode,
    save: (keystore: KeystoreT): Promise<void> => {
      return window.ipcRenderer.invoke('save-keystores-message', JSON.stringify(keystore, null, '\t'))
    }
  })

  if (walletResult.isErr()) {
    console.log(`🤷‍♂️ Failed to create wallet: ${walletResult.error}`)
    throw walletResult.error
  }

  const signingKeychain = walletResult.value

  return Wallet.create({
    signingKeychain,
    network
  })
}

export const hasKeystore = (): Promise<boolean> => new Promise((resolve) => {
  window.ipcRenderer.invoke('get-keystore-message')
    .then((json: string | undefined) => {
      return resolve(!!json)
    })
})

export const touchKeystore = (): Promise<KeystoreT> => new Promise((resolve) => {
  window.ipcRenderer.invoke('get-keystore-message')
    .then((json: string) => {
      resolve(JSON.parse(json))
    })
})

export const copyToClipboard = (text: string) => window.ipcRenderer.send('copy-to-clipboard', text)

export const storePin = (pin: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('create-pin', pin))
})

export const validatePin = (pin: string): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('validate-pin-message', pin))
})

export const sendAPDU = (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: readonly number[]) =>
  window.ipcRenderer.invoke('send-apdu', { cla, ins, p1, p2, data: data?.toString('hex') })
