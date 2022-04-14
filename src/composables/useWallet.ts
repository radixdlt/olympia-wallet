import { ref, computed, Ref, ComputedRef } from 'vue'
import {
  AccountAddress,
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
import { HardwareAddress, HardwareDevice } from '@/services/_types'
import { AccountName } from '@/actions/electron/data-store'
import { Router } from 'vue-router'
import { Subscription, Subject, firstValueFrom, zip } from 'rxjs'
import { touchKeystore, hasKeystore, initWallet as createNewWallet, storePin } from '@/actions/vue/create-wallet'
import {
  deleteHardwareWalletAddress,
  getDerivedAccountsIndex,
  getHardwareWalletAddress,
  getHardwareDevices,
  getHardwareDeviceAccounts,
  resetStore,
  saveAccountName,
  saveDerivedAccountsIndex,
  saveDerivedHardwareAccountsIndex,
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
const activeAccount: Ref<AccountT | null> = ref(null)
const activeAddress: Ref<AccountAddressT | null> = ref(null)
const activeNetwork: Ref<Network | null> = ref(null)
const connected = ref(false)
const derivedAccountIndex: Ref<number> = ref(0)
const hardwareAccount: Ref<AccountT | null> = ref(null)
const hardwareAddress: Ref<string> = ref('')
const hardwareDevices: Ref<HardwareDevice[]> = ref([])
const hardwareError: Ref<Error | null> = ref(null)
const hardwareInteractionState: Ref<string> = ref('')
const hasWallet = ref(false)
const ledgerVerifyError: Ref<Error | null> = ref(null)
const nodeUrl: Ref<string | null> = ref(null)
const reloadTrigger = new Subject<number>()
const showDeleteHWWalletPrompt: Ref<boolean> = ref(false)
const showHideAccountModal: Ref<boolean> = ref(false)
const showLedgerVerify: Ref<boolean> = ref(false)
const signingKeychain: Ref<SigningKeychainT | null> = ref(null)
const switching = ref(false)
const updateAvailable: Ref<boolean> = ref(false)
const versionNumber: Ref<string> = ref('')
const wallet: Ref<WalletT | null> = ref(null)
const latestAddress: Ref<string> = ref('')
const loadingLatestAddress: Ref<boolean> = ref(true)
const attemptingToConnectToHardwareAddress: Ref<HardwareAddress | null> = ref(null)
let postActivationCallback: () => void = () => { return false }

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
  readonly activeAddress: Ref<AccountAddressT | null>;
  readonly activeNetwork: Ref<Network | null>;
  readonly connected: ComputedRef<boolean>;
  readonly derivedAccountIndex: Ref<number>;
  readonly explorerUrlBase: ComputedRef<string>;
  readonly hardwareAccount: Ref<AccountT | null>;
  readonly hardwareAddress: Ref<string | null>;
  readonly hardwareDevices: Ref<HardwareDevice[]>;
  readonly hardwareError: Ref<Error | null>;
  readonly hardwareInteractionState: Ref<string>;
  readonly hasWallet: Ref<boolean>;
  readonly ledgerVerifyError: Ref<Error | null>;
  readonly networkPreamble: ComputedRef<string>;
  readonly nodeUrl: ComputedRef<string | null>;
  readonly radix: ReturnType<typeof Radix.create>;
  readonly showDeleteHWWalletPrompt: Ref<boolean>;
  readonly showHideAccountModal: Ref<boolean>;
  readonly showLedgerVerify: Ref<boolean>;
  readonly switching: ComputedRef<boolean>;
  readonly updateAvailable: Ref<boolean>;
  readonly versionNumber: Ref<string>;
  readonly walletHasLoaded: ComputedRef<boolean>;
  readonly loadingLatestAddress: ComputedRef<boolean>;

  accountNameFor: (address: AccountAddressT) => string;
  deviceNameFor: (address: AccountAddressT) => string;
  accountRenamed: (newName: string) => void;
  activateAccount: (x: () => void) => Promise<AccountT | false>;
  addAccount: () => Promise<AccountT | false>;
  addHardwareAccount: () => void;
  connectHardwareWallet: (address: HardwareAddress) => Promise<void>;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  deleteLocalHardwareAddress: () => void;
  deviceRenamed: (newName: string) => void;
  hideLedgerVerify: () => void;
  hideLedgerInteraction: () => void;
  initWallet: (router: Router) => void;
  loginWithWallet: (password: string) => Promise<ReturnType<typeof Radix.create>>;
  persistNodeUrl: (url: string) => Promise<void>;
  reloadSubscriptions: () => void;
  reset: () => void;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
  setActiveAddress: (address: string) => void;
  setDeleteHWWalletPrompt: (val: boolean) => void;
  setHideAccountModal: (val: boolean) => void;
  setConnected: (value: boolean) => void;
  setNetwork: (network: Network | null) => void;
  setPin: (pin: string) => Promise<string>;
  setSwitching: (value: boolean) => void;
  setWallet: (newWallet: WalletT) => WalletT;
  switchAddress: (address: AccountAddressT) => void;
  updateConnection: (n: string) => Promise<void>;
  verifyHardwareWalletAddress: () => void;
  waitUntilAllLoaded: () => Promise<any>;
  walletLoaded: () => void;
  retryWithConnectedHardwareWallet: () => void;
}

const walletLoaded = async () => {
  wallet.value = await firstValueFrom(radix.__wallet)
  hasWallet.value = true
}

const invalidPasswordError: Ref<WalletError | null> = ref(null)

// Disable errors sink for now in favor of API errors
// radix.errors
//   .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
//   .subscribe((errorNotification: ErrorT<'wallet'>) => { invalidPasswordError.value = errorNotification })

hasKeystore().then((res: boolean) => { hasWallet.value = res })

const allLoadedObservable = zip(
  radix.activeAccount,
  radix.accounts
)

const fetchAccountsForNetwork = async (network: Network) => {
  const index = await getDerivedAccountsIndex(network)
  derivedAccountIndex.value = Number(index)
  hardwareAddress.value = await getHardwareWalletAddress(network)

  if (index) {
    accounts.value = await firstValueFrom(radix.restoreLocalHDAccountsToIndex(Number(index) + 1))
  } else {
    saveDerivedAccountsIndex(0, network)
  }
  return accounts.value
}

const waitUntilAllLoaded = async () => firstValueFrom(allLoadedObservable)
const explorerUrlBase: Ref<string> = ref('')

const reloadSubscriptions = () => reloadTrigger.next(Math.random())

const initWallet = async (router: Router) => {
  const account = await firstValueFrom(radix.activeAccount)
  const networkRes = await firstValueFrom(radix.ledger.networkId())
  latestAddress.value = await getLatestAccountAddress(networkRes)
  accountNames.value = await getAccountNames()
  versionNumber.value = await getVersionNumber()
  updateAvailable.value = await getIsUpdateAvailable()
  hardwareDevices.value = await getHardwareDevices(networkRes)
  await fetchAccountsForNetwork(networkRes)

  activeAccount.value = account
  activeAddress.value = account.address
  activeNetwork.value = networkRes

  const latestIsActive = activeAddress.value
    ? activeAddress.value.toString() === latestAddress.value : false

  if (networkRes === Network.MAINNET) explorerUrlBase.value = 'https://explorer.radixdlt.com/'
  else explorerUrlBase.value = 'https://stokenet-explorer.radixdlt.com/'

  if (!latestIsActive) {
    router.push(`/wallet/${latestAddress.value}`)
  } else {
    router.push(`/wallet/${activeAddress.value.toString()}`)
    loadingLatestAddress.value = false
  }
}

const addAccount = async () : Promise<AccountT | false> => {
  if (!activeNetwork.value) return false
  const index = await getDerivedAccountsIndex(activeNetwork.value)
  await saveDerivedAccountsIndex(Number(index) + 1, activeNetwork.value)
  radix.deriveNextAccount({ alsoSwitchTo: true })
  const newAccount = await firstValueFrom(radix.activeAccount)
  setActiveAddress(newAccount.address.toString())
  fetchAccountsForNetwork(activeNetwork.value)
  accounts.value = await firstValueFrom(radix.accounts)
  return newAccount
}

const addHardwareAccount = async () => {
  if (!activeNetwork.value) return
  getDerivedAccountsIndex(activeNetwork.value)
    .then((index: string) => {
      if (!activeNetwork.value) return
      saveDerivedHardwareAccountsIndex(Number(index) + 1, activeNetwork.value, 'tdx1qsps3cs7dkhhpgrvulm32222cgrekn99d9sqke48e0vw0echs9w2hysn46mcy')

      // radix.deriveNextAccount({ alsoSwitchTo: true })
    })
}

const switchAddress = (address: AccountAddressT) => {
  const newAddress = address.toString()
  if (newAddress === activeAddress.value?.toString()) return
  latestAddress.value = newAddress
  loadingLatestAddress.value = false

  if (activeNetwork.value) {
    fetchAccountsForNetwork(activeNetwork.value)
    saveLatestAccountAddress(newAddress, activeNetwork.value)
  }
}

const setActiveAddress = (accountAddressValue: string) => {
  const address = AccountAddress.fromUnsafe(accountAddressValue)
  if (address.isErr()) {
    throw Error('Invalid Address')
  }
  activeAddress.value = address.value
  switchAddress(address.value)
}

const accountNameFor = (accountAddress: AccountAddressT): string => {
  const accountName = accountNames.value.find((accountName: AccountName) => accountAddress.toString() === accountName.address)
  return accountName ? accountName.name : ''
}

const connectHardwareWallet = async (hwaddr: HardwareAddress) => {
  if (hardwareAccount.value && hardwareAccount.value.address.equals(hwaddr.address)) {
    switchAddress(hwaddr.address)
    return
  }
  hardwareError.value = null
  hardwareInteractionState.value = 'DERIVING'

  const data = {
    keyDerivation: HDPathRadix.create({
      address: { index: hwaddr.index, isHardened: true }
    }),
    hardwareWalletConnection: HardwareWalletLedger.create({
      send: sendAPDU
    }),
    alsoSwitchTo: true,
    verificationPrompt: !(hwaddr.address.toString() !== hardwareAddress.value)
  }

  const wallet = await firstValueFrom(radix.__wallet)

  firstValueFrom(wallet.deriveHWAccount(data)).then((hwAccount: AccountT) => {
    if (!hardwareAddress.value && activeNetwork.value) {
      saveHardwareWalletAddress(hwAccount.address.toString(), activeNetwork.value)
      // saveAccountName(hwAccount.address.toString(), 'Hardware Account')
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
const setHideAccountModal = (val: boolean) => { showHideAccountModal.value = val }

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

const activateAccount = (callback: () => void) : Promise<AccountT | false> => {
  if (!activeAddress.value || !accounts.value) return Promise.resolve(false)
  postActivationCallback = callback
  const localAccount = accounts.value?.all.find((account: AccountT) => {
    if (!activeAddress.value) return false
    return account.address.equals(activeAddress.value) && account.signingKey.isLocalHDSigningKey
  })

  if (localAccount) {
    radix.switchAccount({ toAccount: localAccount })
    return firstValueFrom(radix.activeAccount).then((account) => {
      activeAccount.value = account
      callback()
      return account
    })
  }

  const hardwareAddress =
    hardwareDevices.value
      .flatMap((device) => device.addresses)
      .find((addr: HardwareAddress) => {
        if (!activeAddress.value) return false
        return addr.address.equals(activeAddress.value)
      })
  if (!hardwareAddress) return Promise.resolve(false)
  attemptingToConnectToHardwareAddress.value = hardwareAddress

  return connectHardwareWallet(hardwareAddress).then(() => {
    if (!activeAccount.value) return false
    callback()
    return activeAccount.value
  })
}

const retryWithConnectedHardwareWallet = () => {
  if (!attemptingToConnectToHardwareAddress.value || !postActivationCallback) return
  connectHardwareWallet(attemptingToConnectToHardwareAddress.value).then(() => {
    postActivationCallback()
  })
}

export default function useWallet (router: Router): useWalletInterface {
  const accountRenamed = (newName: string) => {
    if (!activeAddress.value) return
    router.push(`/wallet/${activeAddress.value.toString()}`)
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
  const deviceRenamed = (newName: string) => {
    if (!activeAddress.value) return
    router.push(`/wallet/${activeAddress.value.toString()}`)
  }

  return {
    accounts,
    activeAddress,
    activeNetwork,
    explorerUrlBase: computed(() => explorerUrlBase.value),
    derivedAccountIndex,
    deviceRenamed,
    hardwareAccount,
    hardwareAddress,
    hardwareError,
    hardwareDevices,
    hardwareInteractionState,
    hasWallet,
    ledgerVerifyError,
    loadingLatestAddress: computed(() => loadingLatestAddress.value),
    nodeUrl: computed(() => nodeUrl.value),
    showDeleteHWWalletPrompt,
    showHideAccountModal,
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
      initWallet(router)

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
    deviceNameFor,
    accountRenamed,
    addAccount,
    addHardwareAccount,
    connectHardwareWallet,
    createWallet,
    deleteLocalHardwareAddress,
    hideLedgerInteraction,
    hideLedgerVerify,
    initWallet,
    persistNodeUrl,
    setActiveAddress,
    setDeleteHWWalletPrompt,
    setHideAccountModal,
    setPin,
    setWallet,
    setConnected: (val: boolean) => { connected.value = val },
    switchAddress,
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
    }),

    activateAccount,
    retryWithConnectedHardwareWallet
  }
}
