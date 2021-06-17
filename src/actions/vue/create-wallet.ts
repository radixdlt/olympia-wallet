import { MnemomicT, Wallet, WalletT, KeystoreT, NetworkT, SigningKeychain, Radix, RadixT } from '@radixdlt/application'
import { clipboard } from 'electron'
import crypto from 'crypto'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'
import { store } from '@/actions/electron/data-store'

export const initWallet = async (mnemonic: MnemomicT, passcode: string, network: NetworkT): Promise<WalletT> => {
  const walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
    mnemonic,
    password: passcode,
    save: (keystore: KeystoreT): Promise<void> => new Promise((resolve) => {
      store.set('seed', JSON.stringify(keystore, null, '\t'))
      resolve()
    })
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
  const keystore = getKeystore()
  return resolve(!!keystore)
})

export const touchKeystore = (): Promise<KeystoreT> => new Promise((resolve) => {
  return resolve(getKeystore())
})

export const copyToClipboard = (text: string) => clipboard.writeText(text)

export const storePin = (pin: string): Promise<void> => new Promise((resolve) => {
  digestPin(pin).then((hash: string) => {
    store.set('pin', hash)
    resolve()
  })
})

export const validatePin = (pin: string): Promise<boolean> => new Promise((resolve) => {
  resolve(digestPin(pin).then((inputHash: string) => store.get('pin') === inputHash))
})

let radix: RadixT

export const deriveHWAccount = (): Promise<boolean> => new Promise((resolve) => {
  radix.deriveHWAccount({
    keyDerivation: 'next',
    hardwareWalletConnection: HardwareWalletLedger.create()
  }).subscribe((hwAccount: any) => {
    console.log('got hw account: ', hwAccount.address.toString())
    resolve(!!hwAccount.address)
  })
})

export const login = (password: string, keystore: any) => new Promise((resolve) => {
  radix = Radix
    .create()
    .connect('https://betanet.radixdlt.com/rpc')
    .login(password,
      () => new Promise(resolve => {
        resolve(JSON.parse(getKeystore() as string))
      })
    )
})

const getKeystore = () => {
  const json = store.get('seed') as string
  // TODO This may not need to be parsed.
  return JSON.parse(json)
}

const digestPin = async (pin: string) =>
  crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex')
