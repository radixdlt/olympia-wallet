import { ref, computed, Ref, ComputedRef } from 'vue'
import {
  AccountAddressT,
  AccountsT,
  AccountT,
  ErrorT,
  ErrorCategory,
  HDPathRadix,
  HRP,
  MnemomicT,
  Network,
  Radix,
  SigningKeychain,
  SigningKeychainT,
  WalletErrorCause,
  WalletT,
  walletError
} from '@radixdlt/application'
import { AccountName } from '@/actions/electron/data-store'
import { Router } from 'vue-router'
import { Subscription, interval, Subject, firstValueFrom, zip, merge } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'
import { touchKeystore, hasKeystore, initWallet as createNewWallet, storePin } from '@/actions/vue/create-wallet'
import {
  deleteHardwareWalletAddress,
  getDerivedAccountsIndex,
  getHardwareWalletAddress,
  resetStore,
  saveAccountName,
  saveDerivedAccountsIndex,
  saveHardwareWalletAddress,
  saveLatestAccountAddress,
  getAccountNames,
  getLatestAccountAddress,
  persistNodeSelection,
  fetchSelectedNodeFromStore
} from '@/actions/vue/data-store'
import {
  getVersionNumber,
  getIsUpdateAvailable,
  refreshApp
} from '@/actions/vue/general'
import { sha256Twice } from '@radixdlt/crypto'

import { sendAPDU } from '@/actions/vue/hardware-wallet'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'
import { defaultNetwork } from '@/helpers/network'

const radix = Radix.create()

export type WalletError = ErrorT<ErrorCategory.WALLET>

const accountNames: Ref<AccountName[]> = ref([])
const accounts: Ref<AccountsT | null> = ref(null)
const allAccounts: Ref<AccountT[]> = ref([])
const activeAccount: Ref<AccountT | null> = ref(null)
const activeAddress: Ref<AccountAddressT | null> = ref(null)
const activeNetwork: Ref<Network | null> = ref(null)
const connected = ref(false)
const derivedAccountIndex: Ref<number> = ref(0)
const hardwareAccount: Ref<AccountT | null> = ref(null)
const hardwareAddress: Ref<string> = ref('')
const hardwareError: Ref<Error | null> = ref(null)
const hardwareInteractionState: Ref<string> = ref('')
const hasWallet = ref(false)
const ledgerVerifyError: Ref<Error | null> = ref(null)
const nodeUrl: Ref<string | null> = ref(null)
const reloadTrigger = new Subject<number>()
const showDeleteHWWalletPrompt: Ref<boolean> = ref(false)
const showLedgerVerify: Ref<boolean> = ref(false)
const signingKeychain: Ref<SigningKeychainT | null> = ref(null)
const switching = ref(false)
const updateAvailable: Ref<boolean> = ref(false)
const versionNumber: Ref<string> = ref('')
const wallet: Ref<WalletT | null> = ref(null)
const latestAddress: Ref<string> = ref('')

const setWallet = (newWallet: WalletT) => {
  wallet.value = newWallet
  return wallet.value
}

const subs = new Subscription()

const createWallet = (mnemonic: MnemomicT, pass: string, network: Network) => {
  const newWalletPromise = createNewWallet(mnemonic, pass, network)

  newWalletPromise.then((newWallet: WalletT) => {
    hasWallet.value = true
    setWallet(newWallet)
    saveDerivedAccountsIndex(0, network)
    persistNodeUrl(defaultNetwork)
  })

  return newWalletPromise
}

const setPin = (pin: string) => storePin(pin)

interface useWalletInterface {
  readonly accounts: Ref<AccountsT | null>;
  readonly allAccounts: Ref<AccountT[]>;
  readonly activeAccount: Ref<AccountT | null>;
  readonly activeAddress: Ref<AccountAddressT | null>;
  readonly activeNetwork: Ref<Network | null>;
  readonly connected: ComputedRef<boolean>;
  readonly derivedAccountIndex: Ref<number>;
  readonly explorerUrlBase: ComputedRef<string>;
  readonly hardwareAccount: Ref<AccountT | null>;
  readonly hardwareAddress: Ref<string | null>;
  readonly hardwareError: Ref<Error | null>;
  readonly hardwareInteractionState: Ref<string>;
  readonly hasWallet: Ref<boolean>;
  readonly ledgerVerifyError: Ref<Error | null>;
  readonly networkPreamble: ComputedRef<string>;
  readonly nodeUrl: ComputedRef<string | null>;
  readonly radix: ReturnType<typeof Radix.create>;
  readonly showDeleteHWWalletPrompt: Ref<boolean>;
  readonly showLedgerVerify: Ref<boolean>;
  readonly switching: ComputedRef<boolean>;
  readonly updateAvailable: Ref<boolean>;
  readonly versionNumber: Ref<string>;
  readonly walletHasLoaded: ComputedRef<boolean>;

  accountNameFor: (address: AccountAddressT) => string;
  accountRenamed: (newName: string) => void;
  addAccount: () => void;
  connectHardwareWallet: () => void;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  deleteLocalHardwareAddress: () => void;
  hideLedgerVerify: () => void;
  hideLedgerInteraction: () => void;
  initWallet: () => void;
  loginWithWallet: (password: string) => Promise<ReturnType<typeof Radix.create>>;
  persistNodeUrl: (url: string) => Promise<void>;
  reloadSubscriptions: () => void;
  reset: () => void;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
  setDeleteHWWalletPrompt: (val: boolean) => void;
  setConnected: (value: boolean) => void;
  setNetwork: (network: Network | null) => void;
  setPin: (pin: string) => Promise<string>;
  setSwitching: (value: boolean) => void;
  setWallet: (newWallet: WalletT) => WalletT;
  switchAccount: (account: AccountT) => void;
  updateConnection: (n: string) => Promise<void>;
  verifyHardwareWalletAddress: () => void;
  waitUntilAllLoaded: () => Promise<any>;
  walletLoaded: () => void;
}

const tokenBalanceTrigger = merge(
  interval(15 * 1_000),
  reloadTrigger.asObservable()
)

const walletLoaded = () => {
  radix.__wallet.subscribe((newWallet: WalletT) => { wallet.value = newWallet; hasWallet.value = true })

  radix
    .withTokenBalanceFetchTrigger(tokenBalanceTrigger)
    .withStakingFetchTrigger(interval(15 * 1_000))
}
const invalidPasswordError: Ref<WalletError | null> = ref(null)

// Disable errors sink for now in favor of API errors
// radix.errors
//   .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
//   .subscribe((errorNotification: ErrorT<'wallet'>) => { invalidPasswordError.value = errorNotification })

hasKeystore().then((res: boolean) => { hasWallet.value = res })

const allLoadedObservable = zip(
  radix.activeAccount,
  radix.accounts,
  radix.activeAddress
)

const fetchAccountsForNetwork = (network: Network) => {
  getDerivedAccountsIndex(network)
    .then((accountsIndex: string) => {
      derivedAccountIndex.value = Number(accountsIndex)
      if (accountsIndex) {
        firstValueFrom(radix.restoreLocalHDAccountsToIndex(Number(accountsIndex) + 1))
          .then((accountsRes: AccountsT) => { accounts.value = accountsRes })
      } else {
        saveDerivedAccountsIndex(0, network)
      }
    })
  getHardwareWalletAddress(network).then(a => { hardwareAddress.value = a })
}

const waitUntilAllLoaded = async () => firstValueFrom(allLoadedObservable)
const explorerUrlBase: Ref<string> = ref('')

const reloadSubscriptions = () => reloadTrigger.next(Math.random())

const initWallet = (): void => {
  subs.add(reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.activeAccount))
    .subscribe((account: AccountT) => { activeAccount.value = account }))

  subs.add(reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.accounts))
    .subscribe((accountsRes: AccountsT) => {
      accounts.value = accountsRes
      allAccounts.value = accountsRes.all

      const latestIsActive = activeAccount.value
        ? activeAccount.value.address.toString() === latestAddress.value : false

      const foundLatest = accountsRes.all.find((a: AccountT) =>
        latestAddress.value === a.address.toString()
      )

      if (foundLatest && !latestIsActive) switchAccount(foundLatest)
    }))

  subs.add(reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.activeAddress))
    .subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))

  const networkObserver = reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.ledger.networkId()))
    .subscribe((network: Network) => {
      activeNetwork.value = network
      fetchAccountsForNetwork(network)
      if (network === Network.MAINNET) explorerUrlBase.value = 'https://explorer.radixdlt.com/'
      else explorerUrlBase.value = 'https://stokenet-explorer.radixdlt.com/'

      getLatestAccountAddress(network).then((acctAddress) => {
        latestAddress.value = acctAddress
      })
    })

  subs.add(networkObserver)

  reloadSubscriptions()
  getAccountNames().then((names) => {
    accountNames.value = names
  })
  getVersionNumber().then((res) => { versionNumber.value = res })
  getIsUpdateAvailable().then((res) => { updateAvailable.value = res })
}

const addAccount = () => {
  if (!activeNetwork.value) return
  getDerivedAccountsIndex(activeNetwork.value)
    .then((index: string) => {
      if (!activeNetwork.value) return
      saveDerivedAccountsIndex(Number(index) + 1, activeNetwork.value)
      radix.deriveNextAccount({ alsoSwitchTo: true })
    })
}

const switchAccount = (account: AccountT) => {
  const newAddress = account.address.toString()
  if (newAddress !== activeAddress.value?.toString()) {
    radix.switchAccount({ toAccount: account })
    if (activeNetwork.value) {
      fetchAccountsForNetwork(activeNetwork.value)
      saveLatestAccountAddress(newAddress, activeNetwork.value)
    }
    latestAddress.value = newAddress
    reloadSubscriptions()
  }
}

const accountNameFor = (accountAddress: AccountAddressT): string => {
  const accountName = accountNames.value.find((accountName: AccountName) => accountAddress.toString() === accountName.address)
  return accountName ? accountName.name : ''
}

const connectHardwareWallet = () => {
  if (hardwareAccount.value) {
    switchAccount(hardwareAccount.value)
    return
  }
  hardwareError.value = null
  hardwareInteractionState.value = 'DERIVING'

  const data = {
    keyDerivation: HDPathRadix.create({
      address: { index: 0, isHardened: true }
    }),
    hardwareWalletConnection: HardwareWalletLedger.create({
      send: sendAPDU
    }),
    alsoSwitchTo: true,
    verificationPrompt: !hardwareAddress.value
  }

  firstValueFrom(radix.__wallet).then((wallet: WalletT) => {
    return firstValueFrom(wallet.deriveHWAccount(data))
  }).then((hwAccount: AccountT) => {
    if (!hardwareAddress.value && activeNetwork.value) {
      saveHardwareWalletAddress(hwAccount.address.toString(), activeNetwork.value)
      saveAccountName(hwAccount.address.toString(), 'Hardware Account')
      hardwareAddress.value = hwAccount.address.toString()
    }
    activeAccount.value = hwAccount
    hardwareAccount.value = hwAccount
    hardwareInteractionState.value = ''

    getAccountNames().then((names) => {
      accountNames.value = names
    })
  }).catch((err) => {
    hardwareError.value = err
  })
}

const verifyHardwareWalletAddress = () => {
  radix.displayAddressForActiveHWAccountOnHWDeviceForVerification()
    .subscribe({
      error: (e) => { ledgerVerifyError.value = e }
    })
  showLedgerVerify.value = true
}

const setDeleteHWWalletPrompt = (val: boolean) => { showDeleteHWWalletPrompt.value = val }

const deleteLocalHardwareAddress = () => {
  if (activeNetwork.value) {
    deleteHardwareWalletAddress(activeNetwork.value)
  }
  hardwareAddress.value = ''
  showDeleteHWWalletPrompt.value = false
  hardwareAccount.value = null
}

const hashNodeUrl = async (url:string, signingKeychain: SigningKeychainT): Promise<string> => {
  const hashedUrl = sha256Twice(url)
  const signed = signingKeychain.signHash(hashedUrl)
  const signedHash = await firstValueFrom(signed)
  return signedHash.toDER()
}

const persistNodeUrl = async (url: string): Promise<void> => {
  if (!signingKeychain.value) return
  const hash = await hashNodeUrl(url, signingKeychain.value)
  const saveToStore = await persistNodeSelection(url, hash)
}

const fetchSavedNodeUrl = async (signingKeychain: SigningKeychainT): Promise<string> => {
  const { selectedNode, selectedNodeHash } = await fetchSelectedNodeFromStore()
  if (!selectedNode) {
    // set a default node, one did not exist.
    const defaultToMainnet = 'https://mainnet.radixdlt.com'
    const hash = await hashNodeUrl(defaultToMainnet, signingKeychain)
    const saveToStore = await persistNodeSelection(defaultToMainnet, hash)
    return defaultToMainnet
  }
  const rehash = await hashNodeUrl(selectedNode, signingKeychain)

  if (rehash !== selectedNodeHash) throw new Error('Invalid Node Hash!')
  return selectedNode
}

const hideLedgerInteraction = () => {
  hardwareInteractionState.value = ''
}

const hideLedgerVerify = () => {
  showLedgerVerify.value = false
}

export default function useWallet (router: Router): useWalletInterface {
  const accountRenamed = (newName: string) => {
    if (!activeAddress.value) return
    router.push('/wallet')
    const existingName = accountNames.value.find((accountName: AccountName) => activeAddress.value && activeAddress.value.toString() === accountName.address)
    if (!existingName) {
      accountNames.value.push({ name: newName, address: activeAddress.value.toString() })
      return
    }

    accountNames.value = accountNames.value.map((accountName: AccountName) => {
      if (!activeAddress.value) return accountName
      if (accountName === existingName) {
        return { ...accountName, name: newName }
      }
      return accountName
    })
  }

  return {
    accounts,
    activeAccount,
    activeAddress,
    activeNetwork,
    allAccounts,
    explorerUrlBase: computed(() => explorerUrlBase.value),
    derivedAccountIndex,
    hardwareAccount,
    hardwareAddress,
    hardwareError,
    hardwareInteractionState,
    hasWallet,
    ledgerVerifyError,
    nodeUrl: computed(() => nodeUrl.value),
    showDeleteHWWalletPrompt,
    showLedgerVerify,
    connected: computed(() => connected.value),
    switching: computed(() => switching.value),
    radix,
    walletHasLoaded: computed(() => {
      return activeAddress.value != null
    }),

    async loginWithWallet (password: string) {
      const signingKeychainResult = await SigningKeychain.byLoadingAndDecryptingKeystore({
        password,
        load: touchKeystore
      })

      if (signingKeychainResult.isErr()) {
        throw walletError(new Error('Invalid Password'))
      }

      signingKeychain.value = signingKeychainResult._unsafeUnwrap()
      hasWallet.value = true

      const url = await fetchSavedNodeUrl(signingKeychain.value)
      radix.connect(url).then(() => { connected.value = true })
      const client = await radix.login(password, touchKeystore)
      nodeUrl.value = url
      initWallet()
      // const loaded = await waitUntilAllLoaded()
      return client
    },

    reset: () => {
      radix.__reset()
    },
    reloadSubscriptions,

    resetWallet: (nextRoute = 'create-wallet') => {
      hasWallet.value = false
      resetStore()
      router.push(`/${nextRoute}`)
    },

    accountNameFor,
    accountRenamed,
    addAccount,
    connectHardwareWallet,
    createWallet,
    deleteLocalHardwareAddress,
    hideLedgerInteraction,
    hideLedgerVerify,
    initWallet,
    persistNodeUrl,
    setDeleteHWWalletPrompt,
    setPin,
    setWallet,
    setConnected: (val: boolean) => { connected.value = val },
    switchAccount,
    updateAvailable,
    verifyHardwareWalletAddress,
    versionNumber,
    waitUntilAllLoaded,
    walletLoaded,
    async updateConnection (url: string): Promise<void> {
      // switching.value = true
      // subs.unsubscribe()
      // await radix.connect(url)
      // nodeUrl.value = url
      // subs = new Subscription()
      // const network = await firstValueFrom(radix.ledger.networkId())
      // accounts.value = null
      // activeNetwork.value = network
      // initWallet()
      persistNodeUrl(url).then(() => {
        refreshApp()
      })

      // switching.value = false
      // return network
    },

    setNetwork (network: Network | null) {
      activeNetwork.value = network
    },

    setSwitching (value: boolean) {
      switching.value = value
    },

    networkPreamble: computed(() => {
      switch (activeNetwork.value) {
        case Network.STOKENET:
          return HRP[Network.STOKENET].account
        case Network.MAINNET:
          return HRP[Network.MAINNET].account
        default:
          return ''
      }
    })
  }
}
