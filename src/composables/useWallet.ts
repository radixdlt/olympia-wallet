import { ref, computed, Ref, ComputedRef, watch } from 'vue'
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
  RadixT,
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
  getAccountNames,
  persistNodeSelection,
  fetchSelectedNodeFromStore
} from '@/actions/vue/data-store'
import { sha256Twice } from '@radixdlt/crypto'

import { sendAPDU } from '@/actions/vue/hardware-wallet'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'

const radix: RadixT = Radix.create()

radix.errors
  .subscribe((error: ErrorT<'wallet'>) => {
    console.log(error)
  })

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
const wallet: Ref<WalletT | null> = ref(null)

watch(accounts, () => {
  console.log('accounts changed', accounts.value)
})

const setWallet = (newWallet: WalletT) => {
  wallet.value = newWallet
  return wallet.value
}

let subs = new Subscription()

const createWallet = (mnemonic: MnemomicT, pass: string, network: Network) => {
  const newWalletPromise = createNewWallet(mnemonic, pass, network)

  newWalletPromise.then((newWallet: WalletT) => {
    setWallet(newWallet)
    saveDerivedAccountsIndex(0, network)
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
  readonly explorerUrlBase: ComputedRef<string>;
  readonly hardwareAccount: Ref<AccountT | null>;
  readonly hardwareAddress: Ref<string | null>;
  readonly hardwareError: Ref<Error | null>;
  readonly hardwareInteractionState: Ref<string>;
  readonly hasWallet: Ref<boolean>;
  readonly ledgerVerifyError: Ref<Error | null>;
  readonly showDeleteHWWalletPrompt: Ref<boolean>;
  readonly showLedgerVerify: Ref<boolean>;
  readonly walletHasLoaded: ComputedRef<boolean>;
  readonly derivedAccountIndex: Ref<number>;
  readonly connected: ComputedRef<boolean>;
  readonly switching: ComputedRef<boolean>;
  readonly radix: RadixT;
  readonly networkPreamble: ComputedRef<string>;

  accountNameFor: (address: AccountAddressT) => string;
  accountRenamed: (newName: string) => void;
  addAccount: () => void;
  connectHardwareWallet: () => void;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  deleteLocalHardwareAddress: () => void;
  hardwareAccountFailedToSign: () => void;
  initWallet: () => void;
  loginWithWallet: (password: string) => Promise<RadixT>;
  persistNodeUrl: (url: string) => Promise<void>;
  reloadSubscriptions: () => void;
  reset: () => void;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
  setNetwork: (network: Network) => void;
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
  interval(5 * 1_000),
  reloadTrigger.asObservable()
)

const walletLoaded = () => {
  radix.__wallet.subscribe((newWallet: WalletT) => { wallet.value = newWallet })

  radix
    .withTokenBalanceFetchTrigger(tokenBalanceTrigger)
    .withStakingFetchTrigger(interval(5 * 1_000))
}
const invalidPasswordError: Ref<WalletError | null> = ref(null)

radix.errors
  .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
  .subscribe((errorNotification: ErrorT<'wallet'>) => { invalidPasswordError.value = errorNotification })

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
  getHardwareWalletAddress(network).then(a => { hardwareAddress.value = a; console.log(a, network) })
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
    .subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes; allAccounts.value = accountsRes.all }))

  subs.add(reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.activeAddress))
    .subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))

  const networkObserver = reloadTrigger.asObservable()
    .pipe(switchMap(() => radix.ledger.networkId()))
    .subscribe((network: Network) => {
      activeNetwork.value = network
      fetchAccountsForNetwork(network)
      if (network === 'MAINNET') explorerUrlBase.value = 'https://explorer.radixdlt.com/'
      else explorerUrlBase.value = 'https://stokenet-explorer.radixdlt.com/'
    })

  subs.add(networkObserver)

  reloadSubscriptions()
  getAccountNames().then((names) => {
    accountNames.value = names
  })
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
  radix.switchAccount({ toAccount: account })
  if (activeNetwork.value) {
    fetchAccountsForNetwork(activeNetwork.value)
  }
  reloadSubscriptions()
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
  radix.deriveHWAccount({
    keyDerivation: HDPathRadix.create({
      address: { index: 0, isHardened: true }
    }),
    hardwareWalletConnection: HardwareWalletLedger.create({
      send: sendAPDU
    }),
    alsoSwitchTo: true,
    verificationPrompt: !hardwareAddress.value
  }).subscribe({
    next: (hwAccount: AccountT) => {
      activeAccount.value = hwAccount
      hardwareAccount.value = hwAccount
      if (!hardwareAddress.value && activeNetwork.value) {
        saveHardwareWalletAddress(hwAccount.address.toString(), activeNetwork.value)
        saveAccountName(hwAccount.address.toString(), 'Hardware Wallet')
        hardwareAddress.value = hwAccount.address.toString()
      }
      hardwareInteractionState.value = ''
    },
    error: (err) => { hardwareError.value = err }
  })
}

const verifyHardwareWalletAddress = () => {
  radix.displayAddressForActiveHWAccountOnHWDeviceForVerification()
    .subscribe({
      error: (e) => { ledgerVerifyError.value = e }
    })
  showLedgerVerify.value = true
}

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

const hardwareAccountFailedToSign = () => {
  hardwareAccount.value = null
  hardwareInteractionState.value = 'FAILED_TO_SIGN'
  hardwareError.value = new Error('validations.failedToSign')
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

      const url = await fetchSavedNodeUrl(signingKeychain.value)
      radix.connect(url)
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
    hardwareAccountFailedToSign,
    initWallet,
    persistNodeUrl,
    setPin,
    setWallet,
    switchAccount,
    verifyHardwareWalletAddress,
    waitUntilAllLoaded,
    walletLoaded,
    async updateConnection (url: string): Promise<void> {
      switching.value = true
      subs.unsubscribe()
      await radix.connect(url)
      subs = new Subscription()
      const network = await firstValueFrom(radix.ledger.networkId())
      accounts.value = null
      activeNetwork.value = network
      initWallet()
      persistNodeUrl(url)
      switching.value = false
    },

    setNetwork (network: Network) {
      activeNetwork.value = network
    },

    setSwitching (value: boolean) {
      switching.value = value
    },

    networkPreamble: computed(() => {
      switch (activeNetwork.value) {
        case Network.STOKENET:
          return HRP.STOKENET.account
        case HRP.MAINNET.account:
          return HRP.MAINNET.account
        default:
          return ''
      }
    })
  }
}
