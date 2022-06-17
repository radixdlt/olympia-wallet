import { ref, computed, Ref, ComputedRef } from 'vue'
import { Router } from 'vue-router'

import {
  AccountAddress,
  AccountAddressT,
  AccountsT,
  AccountT,
  AmountT,
  ErrorT,
  ErrorCategory,
  HDPathRadix,
  HRP,
  ManualUserConfirmTX,
  MessageInTransaction,
  MnemomicT,
  Network,
  Radix,
  SigningKeychain,
  SigningKeychainT,
  StakeTokensInput,
  UnstakeTokensInput,
  TransferTokensInput,
  TransactionStateSuccess,
  TransactionStateUpdate,
  IntendedAction,
  Token,
  WalletT,
  walletError,
  ExecutedTransaction
} from '@radixdlt/application'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'

import { interval, ReplaySubject, merge, Subscription, Subject, firstValueFrom, zip } from 'rxjs'
import { mergeMap, take, filter, mapTo } from 'rxjs/operators'

import { HardwareAddress, HardwareDevice } from '@/services/_types'
import { AccountName } from '@/actions/electron/data-store'
import { touchKeystore, hasKeystore, initWallet as createNewWallet, storePin } from '@/actions/vue/create-wallet'
import {
  getDerivedAccountsIndex,
  getHardwareDevices,
  resetStore,
  saveDerivedAccountsIndex,
  saveLatestAccountAddress,
  saveHardwareDevices,
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
import router from '@/router'
import useErrors from './useErrors'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

const radix = Radix.create()
const { setError } = useErrors(radix)

export type WalletError = ErrorT<ErrorCategory.WALLET>

const accountNames: Ref<AccountName[]> = ref([])
const accounts: Ref<AccountsT | null> = ref(null)
const activeAccount: Ref<AccountT | null> = ref(null)
const activeAddress: Ref<AccountAddressT | null> = ref(null)
const activeNetwork: Ref<Network | null> = ref(null)
const connected = ref(false)
const derivedAccountIndex: Ref<number> = ref(0)
const hardwareDevices: Ref<HardwareDevice[]> = ref([])
const hardwareError: Ref<Error | null> = ref(null)
const hardwareInteractionState: Ref<string> = ref('')
const hasWallet = ref(false)
const ledgerVerifyError: Ref<Error | null> = ref(null)
const nativeToken: Ref<Token | null> = ref(null)
const nodeUrl: Ref<string | null> = ref(null)
const reloadTrigger = new Subject<number>()
const showDeleteHWWalletPrompt: Ref<boolean> = ref(false)
const showHideAccountModal: Ref<boolean> = ref(false)
const hardwareDeviceIndexToForget: Ref<number> = ref(-1)
const showNewDevicePopup: Ref<boolean> = ref(false)
const showLedgerVerify: Ref<boolean> = ref(false)
const signingKeychain: Ref<SigningKeychainT | null> = ref(null)
const switching = ref(false)
const updateAvailable: Ref<boolean> = ref(false)
const versionNumber: Ref<string> = ref('')
const updateInProcess: Ref<boolean> = ref(false)
const wallet: Ref<WalletT | null> = ref(null)
const latestAddress: Ref<string> = ref('')
const loadingLatestAddress: Ref<boolean> = ref(true)
const transactionSubs = new Subscription()

const activeMessage: Ref<string> = ref('')
const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
const activeTransactionForm: Ref<string | null> = ref(null)

const selectedCurrency: Ref<Decoded.TokenAmount | null> = ref(null)
const shouldShowConfirmation: Ref<boolean> = ref(false)
const shouldShowMaxUnstakeConfirmation: Ref<boolean> = ref(false)
const confirmationMode: Ref<string | null> = ref(null)
const stakeInput: Ref<StakeTokensInput | null> = ref(null)
const unstakeInput: Ref<UnstakeTokensInput | null> = ref(null)
const transactionErrorMessage: Ref<string | null> = ref(null)
const transactionFee: Ref<AmountT | null> = ref(null)
const transferInput: Ref<TransferTokensInput | null> = ref(null)
const hardwareWalletConnection = HardwareWalletLedger.create({
  send: sendAPDU
})

const setWallet = (newWallet: WalletT) => {
  wallet.value = newWallet
  radix.__reset()
  radix.__withWallet(newWallet)
  return wallet.value
}

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
// can be building, confirm, submitting
const transactionState: Ref<string> = ref('PENDING')
const ledgerState: Ref<string> = ref('')
const transactionError: Ref<Error | null> = ref(null)
const userDidConfirm = new Subject<boolean>()
const userDidCancel = new Subject<boolean>()
const userConfirmation = new ReplaySubject<ManualUserConfirmTX>()

userConfirmation
  .pipe(
    mergeMap((txnToConfirm) =>
      merge(userDidConfirm.pipe(mapTo(true)), userDidCancel.pipe(mapTo(false))).pipe(
        take(1),
        filter((didConfirm) => didConfirm),
        mapTo(txnToConfirm.confirm)
      )
    )
  )
  .subscribe((txnToConfirm) => {
    txnToConfirm()
  })

userDidCancel.subscribe((didCancel: boolean) => {
  if (didCancel) {
    cleanupTransactionSubs()
    shouldShowConfirmation.value = false
    shouldShowMaxUnstakeConfirmation.value = false
    activeMessage.value = ''
    ledgerState.value = ''
    transactionState.value = 'PENDING'
    hardwareError.value = null
    hardwareInteractionState.value = ''
  }
})

const cancelTransaction = () => {
  userDidCancel.next(true)
}

const setActiveTransactionForm = (val: string) => {
  activeTransactionForm.value = val
}

const cleanupInputs = () => {
  transferInput.value = null
  stakeInput.value = null
  unstakeInput.value = null
}

const confirmTransaction = () => {
  const hardwareAddress =
    hardwareDevices.value
      .flatMap((device) => device.addresses)
      .find((addr: HardwareAddress) => {
        if (!activeAddress.value) return false
        return addr.address.equals(activeAddress.value)
      })

  if (activeAddress.value && hardwareAddress && activeAddress.value?.equals(hardwareAddress.address)) {
    ledgerState.value = 'hw-signing'
  }
  userDidConfirm.next(true)
}

// Cleanup subscriptions on cancel and complete
const cleanupTransactionSubs = () => {
  transactionErrorMessage.value = null
}

// After a transaction is completed, cleanup subs and input fields.
// Navigate user to history view
const handleTransactionCompleted = () => {
  shouldShowConfirmation.value = false
  shouldShowMaxUnstakeConfirmation.value = false
  cleanupTransactionSubs()
  activeMessage.value = ''
  ledgerState.value = ''
  transactionState.value = 'PENDING'

  router.push(`/wallet/${activeAddress.value?.toString()}/history`)
}

// Handle information returned from lifecycle event for Transfer, Stake, and Unstake actions
//  - update transactionState for confirmation modal
//  - update fee to display to the user
//  - handle error if it is returned
const handleTransactionLifecycleEvent = (txState: TransactionStateUpdate) => {
  console.log('state update', txState)
  transactionState.value = txState.eventUpdateType
  // To Do:
  // Add pending transactions to list

  const t: any = txState
  if (t.transactionState && t.transactionState.fee) transactionFee.value = t.transactionState.fee
  if (t.error) {
    cancelTransaction()
  }
}

const errorHandler = (err: any) => {
  // To Do: Nicely handle hardware device error when full error is returned from API
  // For now: pattern match on transaction errors that return a "No device found" string or "DisconnectedDevice"
  if (err.toString().indexOf('Error: No device found') >= 0 || err.toString().indexOf('DisconnectedDevice') >= 0) {
    setError({
      ...err,
      type: 'HARDWARE',
      error: {
        category: ''
      }
    })
    cancelTransaction()
    // Catch encypted message is too long error
  } else if (err.toString().indexOf('Plaintext is too long') >= 0) {
    setError({
      ...err,
      type: 'api',
      error: {
        details: {
          type: 'MessageTooLongError'
        }
      }
    })
    cancelTransaction()
  } else if (err.toString().indexOf('Error: Failed to sign tx with Ledger') >= 0 && err.toString().includes('(0x6985')) {
    setError({
      ...err,
      type: 'HARDWARE',
      error: {
        category: 'UserRejectedSignature'
      }
    })
    cancelTransaction()
  } else if (err.toString().indexOf('Error: Failed to sign tx with Ledger') >= 0 && err.toString().includes('(0x530c')) {
    setError({
      ...err,
      type: 'HARDWARE',
      error: {
        category: 'SignatureTimedOut'
      }
    })
    cancelTransaction()
  } else if (err.toString().indexOf('(denied by the user') >= 0) {
    cancelTransaction()
  } else {
    const apiError = { ...err, type: 'api' }
    setError(apiError)
    cancelTransaction()
  }
}

// call transferTokens() with built options and subscribe to confirmation and results
const transferTokens = async (transferTokensInput: TransferTokensInput, message: MessageInTransaction, sc: Decoded.TokenAmount) => {
  await activateAccount()
  cleanupInputs()
  transferInput.value = transferTokensInput
  selectedCurrency.value = sc
  activeMessage.value = message.plaintext
  activeMessageInTransaction.value = message
  confirmationMode.value = 'transfer'

  const { events, completion } = radix.transferTokens({
    transferInput: transferTokensInput,
    userConfirmation,
    pollTXStatusTrigger: interval(1000),
    message
  })

  shouldShowConfirmation.value = true

  transactionSubs.add(
    completion.subscribe(handleTransactionCompleted, errorHandler)
  )
  transactionSubs.add(
    events.subscribe(handleTransactionLifecycleEvent, errorHandler)
  )
}

// call unstakeTokens() with built options and subscribe to confirmation and results
const unstakeTokens = async (unstakeTokensInput: UnstakeTokensInput) => {
  await activateAccount()
  cleanupInputs()
  unstakeInput.value = unstakeTokensInput
  confirmationMode.value = 'unstake'

  const { completion, events } = await radix.unstakeTokens({
    unstakeInput: unstakeTokensInput,
    userConfirmation,
    pollTXStatusTrigger: interval(1000)
  })

  shouldShowConfirmation.value = true
  if (unstakeInput.value.unstake_percentage) {
    shouldShowMaxUnstakeConfirmation.value = true
  }

  transactionSubs.add(
    completion.subscribe(handleTransactionCompleted, errorHandler)
  )
  transactionSubs.add(
    events.subscribe(handleTransactionLifecycleEvent, errorHandler)
  )
}

// call stakeTokens() with built options and subscribe to confirmation and results
const stakeTokens = async (stakeTokensInput: StakeTokensInput) => {
  await activateAccount()
  cleanupInputs()
  stakeInput.value = stakeTokensInput
  confirmationMode.value = 'stake'

  const { completion, events } = await radix.stakeTokens({
    stakeInput: stakeTokensInput,
    userConfirmation,
    pollTXStatusTrigger: interval(1000)
  })

  shouldShowConfirmation.value = true

  transactionSubs.add(
    completion.subscribe(handleTransactionCompleted, errorHandler)
  )
  transactionSubs.add(
    events.subscribe(handleTransactionLifecycleEvent, errorHandler)
  )
}

interface useWalletInterface {
  readonly accounts: Ref<AccountsT | null>;
  readonly activeAddress: Ref<AccountAddressT | null>;
  readonly activeNetwork: Ref<Network | null>;
  readonly connected: ComputedRef<boolean>;
  readonly derivedAccountIndex: Ref<number>;
  readonly explorerUrlBase: ComputedRef<string>;
  readonly hardwareDevices: Ref<HardwareDevice[]>;
  readonly hardwareError: Ref<Error | null>;
  readonly hardwareInteractionState: Ref<string>;
  readonly hasWallet: Ref<boolean>;
  readonly ledgerVerifyError: Ref<Error | null>;
  readonly nativeToken: Ref<Token | null>;
  readonly networkPreamble: ComputedRef<string>;
  readonly nodeUrl: ComputedRef<string | null>;
  readonly radix: ReturnType<typeof Radix.create>;
  readonly showDeleteHWWalletPrompt: Ref<boolean>;
  readonly showHideAccountModal: Ref<boolean>;
  readonly showDisconnectDeviceModal: ComputedRef<boolean>;
  readonly showNewDevicePopup: Ref<boolean>;
  readonly shouldShowMaxUnstakeConfirmation: Ref<boolean>;
  readonly showLedgerVerify: Ref<boolean>;
  readonly switching: ComputedRef<boolean>;
  readonly updateAvailable: Ref<boolean>;
  readonly updateInProcess: Ref<boolean>;
  readonly versionNumber: Ref<string>;
  readonly walletHasLoaded: ComputedRef<boolean>;
  readonly loadingLatestAddress: ComputedRef<boolean>;
  readonly activeMessageInTransaction: Ref<MessageInTransaction | null>;
  readonly activeTransactionForm: Ref<string | null>;
  readonly confirmationMode: Ref<string | null>;
  readonly selectedCurrency: Ref<Decoded.TokenAmount | null>;
  readonly shouldShowConfirmation: Ref<boolean>;
  readonly stakeInput: Ref<StakeTokensInput | null>;
  readonly unstakeInput: Ref<UnstakeTokensInput | null>;
  readonly transactionState: Ref<string>;
  readonly ledgerState: Ref<string>;
  readonly transactionError: Ref<Error | null>;
  readonly transferInput: Ref<TransferTokensInput | null>;
  readonly transactionFee: Ref<AmountT | null>;
  readonly transactionErrorMessage: Ref<string | null>;
  readonly userDidCancel: Subject<boolean>;

  cancelTransaction: () => void;
  confirmTransaction: () => void;
  setActiveTransactionForm: (val: string) => void;
  stakeTokens: (input: StakeTokensInput) => void;
  transferTokens: (input: TransferTokensInput, message: MessageInTransaction, sc: Decoded.TokenAmount) => void;
  unstakeTokens: (input: UnstakeTokensInput) => void;

  accountNameFor: (address: AccountAddressT) => string;
  accountRenamed: (newName: string) => void;
  addAccount: () => Promise<AccountT | false>;
  connectHardwareWallet: (address: HardwareAddress) => Promise<void>;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  decryptMessage: (tx: ExecutedTransaction) => Promise<string>;
  deviceRenamed: () => void;
  hideLedgerVerify: () => void;
  hideLedgerInteraction: () => void;
  initWallet: (router: Router) => void;
  loginWithWallet: (password: string) => Promise<ReturnType<typeof Radix.create>>;
  persistNodeUrl: (url: string) => Promise<void>;
  reloadSubscriptions: () => void;
  reset: () => void;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
  setActiveAddress: (address: string) => void;
  setHideAccountModal: (val: boolean) => void;
  setUpdateInProcess: (val: boolean) => void;
  setDisconnectDeviceModal: (val: number) => void;
  forgetDevice: () => void;
  setShowNewDevicePopup: (val: boolean) => void;
  setConnected: (value: boolean) => void;
  setNetwork: (network: Network | null) => void;
  setPin: (pin: string) => Promise<string>;
  setSwitching: (value: boolean) => void;
  setWallet: (newWallet: WalletT) => WalletT;
  switchAddress: (address: AccountAddressT) => void;
  updateConnection: (n: string) => Promise<void>;
  verifyHardwareWalletAddress: () => Promise<void>;
  waitUntilAllLoaded: () => Promise<any>;
  walletLoaded: () => void;
  createNewHardwareAccount: () => void;
  closeLedgerErrorModal: () => void;
}

const walletLoaded = async () => {
  wallet.value = await firstValueFrom(radix.__wallet)
  hasWallet.value = true
}

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
  nativeToken.value = await firstValueFrom(radix.ledger.nativeToken(networkRes))
  await fetchAccountsForNetwork(networkRes)

  activeAccount.value = account
  activeAddress.value = account.address
  activeNetwork.value = networkRes

  const latestIsActive = activeAddress.value
    ? activeAddress.value.toString() === latestAddress.value : false

  if (networkRes === Network.MAINNET) explorerUrlBase.value = 'https://explorer.radixdlt.com/'
  else explorerUrlBase.value = 'https://stokenet-explorer.radixdlt.com/'
  if (latestIsActive) {
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

const setActiveAddress = async (accountAddressValue: string) => {
  const address = AccountAddress.fromUnsafe(accountAddressValue)
  if (address.isErr()) {
    throw Error('Invalid Address')
  }
  activeAddress.value = address.value
  accounts.value = await firstValueFrom(radix.accounts)
  switchAddress(address.value)
}

const accountNameFor = (accountAddress: AccountAddressT): string => {
  const accountName = accountNames.value.find((accountName: AccountName) => accountAddress.toString() === accountName.address)
  return accountName ? accountName.name : ''
}

const setShowNewDevicePopup = (val: boolean) => { showNewDevicePopup.value = val }

const closeLedgerErrorModal = () => { hardwareError.value = null }

const createNewHardwareAccount = async () => {
  if (!activeNetwork.value) return
  const wallet = await firstValueFrom(radix.__wallet)
  try {
    const connectedDeviceAccount = await firstValueFrom(wallet.deriveHWAccount({
      keyDerivation: HDPathRadix.create({
        address: { index: 0, isHardened: true }
      }),
      hardwareWalletConnection,
      alsoSwitchTo: false,
      verificationPrompt: false
    }))
    hardwareError.value = null
    hardwareInteractionState.value = 'DERIVING'
    const hardwareDevice = hardwareDevices.value.find((hw) => hw.addresses.find((addr) => addr.address.equals(connectedDeviceAccount.address)))
    let newHardwareDevices
    if (hardwareDevice) {
      const addressIndexes = hardwareDevice.addresses.map((a) => a.index)
      const newIndex = Math.max(...addressIndexes) + 1
      const newAccount = await firstValueFrom(wallet.deriveHWAccount({
        keyDerivation: HDPathRadix.create({
          address: { index: newIndex, isHardened: true }
        }),
        hardwareWalletConnection,
        alsoSwitchTo: false,
        verificationPrompt: false
      }))

      newHardwareDevices = hardwareDevices.value.map((hwd) => {
        if (hwd.name !== hardwareDevice.name) return hwd
        return {
          name: hardwareDevice.name,
          addresses: [...hardwareDevice.addresses, { name: 'New Hardware Account', address: newAccount.address, index: newIndex }]
        }
      })
      activeAccount.value = newAccount
      hardwareDevices.value = newHardwareDevices
      saveHardwareDevices(activeNetwork.value, newHardwareDevices)
      router.push(`/wallet/${newAccount.address.toString()}`)
    } else {
      const newAddr = connectedDeviceAccount.address.toString()
      const deviceNumber = hardwareDevices.value.length + 1
      const newHardwareDevices = [...hardwareDevices.value, { name: `Hardware Device ${deviceNumber}`, addresses: [{ name: newAddr, address: connectedDeviceAccount.address, index: 0 }] }]
      activeAccount.value = connectedDeviceAccount
      hardwareDevices.value = newHardwareDevices
      saveHardwareDevices(activeNetwork.value, newHardwareDevices)
      hardwareDevices.value = await getHardwareDevices(activeNetwork.value)
      router.push(`/wallet/${connectedDeviceAccount.address.toString()}`)
      setShowNewDevicePopup(true)
    }
    hardwareInteractionState.value = ''
    radix.__withWallet(wallet)
  } catch (err) {
    hardwareInteractionState.value = ''
    hardwareError.value = err as Error
  }
}

const connectHardwareWallet = async (hwaddr: HardwareAddress) => {
  try {
    hardwareError.value = null
    const hwAccount: AccountT = await firstValueFrom(radix.deriveHWAccount({
      keyDerivation: HDPathRadix.create({
        address: { index: hwaddr.index, isHardened: true }
      }),
      hardwareWalletConnection,
      alsoSwitchTo: true,
      verificationPrompt: false
    }))
    console.log('connected to ', hwAccount.address.toString())
    hardwareInteractionState.value = 'DERIVING'
    activeAddress.value = hwAccount.address
    activeAccount.value = hwAccount
    hardwareInteractionState.value = ''
  } catch (err) {
    hardwareInteractionState.value = ''
    hardwareError.value = err as Error
  }
}

const verifyHardwareWalletAddress = async () => {
  await activateAccount()
  showLedgerVerify.value = true
  try {
    await firstValueFrom(radix.displayAddressForActiveHWAccountOnHWDeviceForVerification())
  } catch (e) {
    ledgerVerifyError.value = e as Error
  }
}

const decryptMessage = async (tx: ExecutedTransaction): Promise<string> => {
  await activateAccount()
  const msg = await firstValueFrom(radix.decryptTransaction(tx))
  return msg
}

const setHideAccountModal = (val: boolean) => { showHideAccountModal.value = val }

const setUpdateInProcess = (val: boolean) => {
  updateInProcess.value = val
}

const setDisconnectDeviceModal = (val: number) => {
  hardwareDeviceIndexToForget.value = val
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
  await persistNodeSelection(url, hash)
}

const fetchSavedNodeUrl = async (signingKeychain: SigningKeychainT): Promise<string> => {
  const { selectedNode, selectedNodeHash } = await fetchSelectedNodeFromStore()
  if (!selectedNode) {
    // set a default node, one did not exist.
    const defaultToMainnet = 'https://mainnet.radixdlt.com'
    const hash = await hashNodeUrl(defaultToMainnet, signingKeychain)
    await persistNodeSelection(defaultToMainnet, hash)
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

const isActivating: Ref<boolean> = ref(false)

const activateAccount = async () : Promise<void> => {
  if (isActivating.value) return Promise.resolve()
  if (!activeAddress.value || !accounts.value || !activeAccount.value) throw Error('Invalid Active Address')
  isActivating.value = true
  const currentAddress = activeAddress.value
  const localAccount = accounts.value?.all.find((account: AccountT) => {
    if (!activeAddress.value) return false
    return account.address.equals(activeAddress.value) && account.signingKey.isLocalHDSigningKey
  })

  if (localAccount) {
    radix.switchAccount({ toAccount: localAccount })
    const newAccount = await firstValueFrom(radix.activeAccount)
    activeAccount.value = newAccount
    isActivating.value = false
    return
  }

  const hardwareAddress =
    hardwareDevices.value
      .flatMap((device) => device.addresses)
      .find((addr: HardwareAddress) => {
        if (!activeAddress.value) return false
        return addr.address.equals(activeAddress.value)
      })
  if (!hardwareAddress) throw Error('Invalid Address')

  await connectHardwareWallet(hardwareAddress)
  if (!activeAccount.value || !activeAccount.value.address.equals(hardwareAddress.address)) {
    hardwareError.value = new Error('Unable to activate the correct account')
    activeAddress.value = currentAddress
    hardwareInteractionState.value = 'error'
    isActivating.value = false
    return
  }
  isActivating.value = false
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
  const deviceRenamed = async () => {
    if (!activeAddress.value || !activeNetwork.value) return
    hardwareDevices.value = await getHardwareDevices(activeNetwork.value)
    router.push(`/wallet/${activeAddress.value.toString()}`)
  }

  const forgetDevice = () => {
    if (!activeNetwork.value || hardwareDeviceIndexToForget.value < 0 || !activeAddress.value) return

    const shouldNavigateAwayFromForgottenDevice = hardwareDevices.value[hardwareDeviceIndexToForget.value]?.addresses.find((a) => {
      if (!activeAddress.value) return false
      return a.address.equals(activeAddress.value)
    })

    if (shouldNavigateAwayFromForgottenDevice) {
      if (accounts.value?.all.length === 0) return
      router.push(`/wallet/${accounts.value?.all[0]?.address.toString()}`)
    }

    const newHardwareDevices = hardwareDevices.value.filter((val, i) => i !== hardwareDeviceIndexToForget.value)
    saveHardwareDevices(activeNetwork.value, newHardwareDevices)
    hardwareDevices.value = newHardwareDevices
    hardwareDeviceIndexToForget.value = -1
  }

  return {
    accounts,
    activeAddress,
    activeNetwork,
    explorerUrlBase: computed(() => explorerUrlBase.value),
    derivedAccountIndex,
    deviceRenamed,
    hardwareError,
    hardwareDevices,
    hardwareInteractionState,
    hasWallet,
    ledgerVerifyError,
    loadingLatestAddress: computed(() => loadingLatestAddress.value),
    nativeToken,
    nodeUrl: computed(() => nodeUrl.value),
    showDeleteHWWalletPrompt,
    showHideAccountModal,
    updateInProcess,
    showDisconnectDeviceModal: computed(() => hardwareDeviceIndexToForget.value >= 0),
    showNewDevicePopup,
    showLedgerVerify,
    activeMessageInTransaction,
    activeTransactionForm,
    confirmationMode,
    ledgerState,
    selectedCurrency,
    shouldShowConfirmation,
    shouldShowMaxUnstakeConfirmation,
    stakeInput,
    unstakeInput,
    transactionError,
    transactionState,
    transferInput,
    transactionFee,
    transactionErrorMessage,
    userDidCancel,
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

    cancelTransaction,
    confirmTransaction,
    setActiveTransactionForm,
    stakeTokens,
    transferTokens,
    unstakeTokens,
    decryptMessage,
    accountNameFor,
    accountRenamed,
    addAccount,
    connectHardwareWallet,
    createWallet,
    hideLedgerInteraction,
    hideLedgerVerify,
    initWallet,
    persistNodeUrl,
    setActiveAddress,
    setHideAccountModal,
    setDisconnectDeviceModal,
    forgetDevice,
    setShowNewDevicePopup,
    setPin,
    setWallet,
    setConnected: (val: boolean) => { connected.value = val },
    switchAddress,
    updateAvailable,
    setUpdateInProcess,
    verifyHardwareWalletAddress,
    versionNumber,
    waitUntilAllLoaded,
    walletLoaded,
    async updateConnection (url: string): Promise<void> {
      await persistNodeUrl(url)
      await router.push('/')
      refreshApp()
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

    createNewHardwareAccount,
    closeLedgerErrorModal
  }
}
