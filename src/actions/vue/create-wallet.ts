import { MnemomicT, HDMasterSeed, Wallet, WalletT } from '@radixdlt/account'
import { Result } from 'neverthrow'
import { Keystore } from '@radixdlt/crypto'

export const createWalletFromMnemonicAndPasscode = async (mnemonic: MnemomicT, passcode: string) => {
  const masterSeed = HDMasterSeed.fromMnemonic({ mnemonic })
  const walletResult = await Keystore.encryptSecret({
    secret: masterSeed.seed,
    password: passcode
  })

  if (walletResult.isErr()) {
    console.log(`🤷‍♂️ Failed to create wallet: ${walletResult.error}`)
  } else {
    const wallet = walletResult.value
    window.ipcRenderer.send('save-keystores-message', JSON.stringify(wallet, null, '\t'))
  }
}

export const touchKeystore = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-keystore-message'))
})

export const decryptWallet = async (passcode: string) =>
  touchKeystore()
    .then((json: string) => {
      const keystore = JSON.parse(json)
      return Wallet.fromKeystore({ keystore, password: passcode })
    })
    .then((res: Result<WalletT, Error>) => {
      if (res.isErr()) {
        console.log(`🤷‍♂️ Failed to decrypt wallet: ${res.error}`)
      } else {
        return res.value
      }
    })
