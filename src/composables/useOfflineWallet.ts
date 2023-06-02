/*
 Very simple composable that builds account details based on the keychain.

 This composable assumes that the wallet is referencing mainnet as we build
 a solution for exporting olympia wallet content without any olympia network
 access.
*/
import {
  AccountsT,
  AccountAddressT,
  SigningKeychain,
  Wallet,
  WalletT
} from '@radixdlt/application'
import { Network } from '@radixdlt/primitives'

import { getDerivedAccountsIndex, getHardwareDevices, getAccountNames } from '@/actions/vue/data-store'
import { AccountName } from '@/actions/electron/data-store'
import { touchKeystore } from '@/actions/vue/create-wallet'
import { Ref, ref } from 'vue'
import { firstValueFrom } from 'rxjs'
import { HardwareDevice } from '@/services/_types'

const wallet: Ref<WalletT | null> = ref(null)
const network = Network.MAINNET
const accounts: Ref<AccountsT | null> = ref(null)
const hardwareDevices: Ref<HardwareDevice[]> = ref([])
const accountNames: Ref<AccountName[]> = ref([])

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
  accounts.value = await firstValueFrom(wallet.value.restoreLocalHDAccountsToIndex(Number(index) + 1))
  hardwareDevices.value = await getHardwareDevices(network)
  accountNames.value = await getAccountNames()
}

const revealMnemonic = () => {
  if (!wallet.value) return
  return wallet.value.revealMnemonic()
}

const accountNameFor = (accountAddress: AccountAddressT): string => {
  const accountName = accountNames.value.find((accountName: AccountName) => accountAddress.toString() === accountName.address)
  return accountName ? accountName.name : ''
}

const useOfflineWallet = () => ({
  accounts,
  hardwareDevices,
  wallet,
  accountNameFor,
  fetch,
  login,
  revealMnemonic
})

export default useOfflineWallet
