import { MnemomicT, Wallet, WalletT, KeystoreT } from '@radixdlt/application'
import { Result } from 'neverthrow'

export const createWalletFromMnemonicAndPasscode = (mnemonic: MnemomicT, passcode: string): Promise<WalletT> => new Promise((resolve, reject) => {
  Wallet.byEncryptingMnemonicAndSavingKeystore({
    mnemonic,
    password: passcode,
    save: (keystore: KeystoreT): Promise<void> => {
      return window.ipcRenderer.invoke('save-keystores-message', JSON.stringify(keystore, null, '\t'))
    }
  })
    .then((walletResult: Result<WalletT, Error>) => {
      if (walletResult.isErr()) {
        console.log(`🤷‍♂️ Failed to create wallet: ${walletResult.error}`)
        reject(walletResult.error)
      } else {
        const wallet: WalletT = walletResult.value
        resolve(wallet)
      }
    })
})

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
