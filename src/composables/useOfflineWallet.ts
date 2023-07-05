/*
 Very simple composable that builds account details based on the keychain.

 This composable assumes that the wallet is referencing mainnet as we build
 a solution for exporting olympia wallet content without any olympia network
 access.
*/
import {
  AccountsT,
  SigningKeychain,
  Wallet,
  WalletT
} from '@radixdlt/application'
import { Network } from '@radixdlt/primitives'

import { getDerivedAccountsIndex, getHardwareDevices } from '@/actions/vue/data-store'
import { touchKeystore } from '@/actions/vue/create-wallet'
import { Ref, ref } from 'vue'
import { firstValueFrom } from 'rxjs'
import { HardwareDevice } from '@/services/_types'

const wallet: Ref<WalletT | null> = ref(null)
const network = Network.MAINNET
const accounts: Ref<AccountsT | null> = ref(null)
const hardwareDevices: Ref<HardwareDevice[]> = ref([])
const accountIndex: Ref<number | null> = ref(null)

const login = async (password: string) => {
  const signingKeychainResult = await SigningKeychain.byLoadingAndDecryptingKeystore({
    password,
    load: touchKeystore
  })
  if (signingKeychainResult.isErr()) {
    throw new Error('Invalid password')
  }

  wallet.value = Wallet.create({
    signingKeychain: signingKeychainResult.value,
    network
  })
}

const fetch = async () => {
  if (!wallet.value) return
  const index = await getDerivedAccountsIndex(network)
  if (Number(index) === accountIndex.value) return
  accountIndex.value = Number(index)
  const numberToRestore = Number(index) === 0 ? Number(index) : Number(index) + 1
  accounts.value = await firstValueFrom(wallet.value.restoreLocalHDAccountsToIndex(numberToRestore))
  hardwareDevices.value = await getHardwareDevices(network)
}

const revealMnemonic = () => {
  if (!wallet.value) return null
  return wallet.value.revealMnemonic()
}

const useOfflineWallet = () => ({
  accounts,
  wallet,
  hardwareDevices,
  fetch,
  login,
  revealMnemonic
})

export default useOfflineWallet
