import { MnemomicT, Wallet, WalletT, KeystoreT, IdentityManager, NetworkT, IdentityManagerT } from '@radixdlt/application'

export const createIdentityManager = async (mnemonic: MnemomicT, passcode: string, network: NetworkT): Promise<IdentityManagerT> => {
  const walletResult = await Wallet.byEncryptingMnemonicAndSavingKeystore({
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

  const wallet: WalletT = walletResult.value

  return IdentityManager.create({
    wallet,
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
