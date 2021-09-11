import { ref, computed, Ref, ComputedRef } from 'vue'
import {
  AccountAddressT,
  AccountsT,
  AccountT,
  AmountT,
  ErrorT,
  ErrorCategory,
  ExecutedTransaction,
  FinalizedTransaction,
  HDPathRadix,
  IntendedAction,
  ManualUserConfirmTX,
  MessageInTransaction,
  MnemomicT,
  Network,
  RadixT,
  StakeOptions,
  StakePositions,
  StakeTokensInput,
  Token,
  TokenBalance,
  TokenBalances,
  TransactionHistory,
  TransactionHistoryOfKnownAddressRequestInput,
  TransactionIdentifierT,
  TransactionIntent,
  TransactionStateError,
  TransactionStateSuccess,
  TransactionStateUpdate,
  TransactionTracking,
  TransferTokensInput,
  TransferTokensOptions,
  UnstakeOptions,
  UnstakePositions,
  UnstakeTokensInput,
  WalletErrorCause,
  WalletT
} from '@radixdlt/application'
import { AccountName } from '@/actions/electron/data-store'
import { Router } from 'vue-router'
import { Subscription, interval, Subject, Observable, combineLatest, BehaviorSubject, ReplaySubject, firstValueFrom, zip } from 'rxjs'
import { filter, mergeMap, retry, switchMap } from 'rxjs/operators'
import { touchKeystore, hasKeystore, initWallet, storePin } from '@/actions/vue/create-wallet'
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

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

export type WalletError = ErrorT<ErrorCategory.WALLET>

const accounts: Ref<AccountsT | null> = ref(null)
const accountNames: Ref<AccountName[]> = ref([])
const activeAccount: Ref<AccountT | null> = ref(null)
const activeAddress: Ref<AccountAddressT | null> = ref(null)
const activeMessage: Ref<string> = ref('')
const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
const activeStakes: Ref<StakePositions | null> = ref(null)
const activeTransaction: Ref<TransactionTracking | null> = ref(null)
const activeTransactionForm: Ref<string | null> = ref(null)
const activeUnstakes: Ref<UnstakePositions | null> = ref(null)
const canGoNext: Ref<boolean> = ref(false)
const confirmationMode: Ref<string | null> = ref(null)
const cursorStack: Ref<string[]> = ref([])
const decryptedMessages: Ref<{id: string, message: string}[]> = ref([])
const draftTransaction: Ref<TransactionIntent | null> = ref(null)
const hardwareAccount: Ref<AccountT | null> = ref(null)
const hasCalculatedFee: Ref<boolean> = ref(false)
const hasWallet = ref(false)
const ledgerTxError: Ref<Error | null> = ref(null)
const ledgerVerifyError: Ref<Error | null> = ref(null)
const nativeToken: Ref<Token | null> = ref(null)
const nativeTokenBalance: Ref<TokenBalance | null> = ref(null)
const pendingTransactions: Ref<Array<PendingTransaction>> = ref([])
const selectedCurrency: Ref<TokenBalance | null> = ref(null)
const shouldShowConfirmation: Ref<boolean> = ref(false)
const showLedgerVerify: Ref<boolean> = ref(false)
const sidebar = ref('default')
const stakeInput: Ref<StakeTokensInput | null> = ref(null)
const tokenBalances: Ref<TokenBalances | null> = ref(null)
const transactionErrorMessage: Ref<string | null> = ref(null)
const transactionFee: Ref<AmountT | null> = ref(null)
const transactionHistory: Ref<TransactionHistory> = ref({ transactions: [], cursor: '' })
const transactionToConfirm: Ref<ManualUserConfirmTX | null> = ref(null)
const transferInput: Ref<TransferTokensInput | null> = ref(null)
const wallet: Ref<WalletT | null> = ref(null)
const nodeUrl: Ref<string | null> = ref(null)

const loadingHistory: Ref<boolean> = ref(true)
const loadingHistoryPage: Ref<boolean> = ref(true)

// can be building, confirm, submitting
const transactionState: Ref<string> = ref('confirm')

const hardwareInteractionState: Ref<string> = ref('')

const userDidConfirm = new Subject<boolean>()
const userDidCancel = new Subject<boolean>()
let userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()
const reloadTrigger = new Subject<number>()

const hardwareAddress: Ref<string> = ref('')
const hardwareError: Ref<Error | null> = ref(null)
getHardwareWalletAddress().then(a => { hardwareAddress.value = a })
const showDeleteHWWalletPrompt: Ref<boolean> = ref(false)

const setWallet = (newWallet: WalletT) => {
  wallet.value = newWallet
  return wallet.value
}

const subs = new Subscription()

const createWallet = (mnemonic: MnemomicT, pass: string, network: Network) => {
  const newWalletPromise = initWallet(mnemonic, pass, network)

  newWalletPromise.then((newWallet: WalletT) => {
    setWallet(newWallet)
    saveDerivedAccountsIndex(0)
  })

  return newWalletPromise
}

const setPin = (pin: string) => storePin(pin)

const PAGE_SIZE = 50

interface useWalletInterface {
  readonly accounts: Ref<AccountsT | null>;
  readonly activeAccount: Ref<AccountT | null>;
  readonly activeAddress: Ref<AccountAddressT | null>;
  readonly activeMessageInTransaction: Ref<MessageInTransaction | null>;
  readonly activeStakes: Ref<StakePositions | null>;
  readonly activeTransaction: Ref<TransactionTracking | null>;
  readonly activeTransactionForm: Ref<string | null>;
  readonly activeUnstakes: Ref<UnstakePositions | null>;
  readonly confirmationMode: Ref<string | null>;
  readonly decryptedMessages: Ref<{id: string, message: string}[]>;
  readonly hardwareAccount: Ref<AccountT | null>;
  readonly hardwareAddress: Ref<string | null>;
  readonly hardwareError: Ref<Error | null>;
  readonly hardwareInteractionState: Ref<string>;
  readonly hasWallet: Ref<boolean>;
  readonly ledgerTxError: Ref<Error | null>;
  readonly ledgerVerifyError: Ref<Error | null>;
  readonly nativeToken: Ref<Token | null>;
  readonly nativeTokenBalance: Ref<TokenBalance | null>;
  readonly invalidPasswordError: Ref<WalletError | null>;
  readonly selectedCurrency: Ref<TokenBalance | null>;
  readonly shouldShowConfirmation: Ref<boolean>;
  readonly showDeleteHWWalletPrompt: Ref<boolean>;
  readonly showLedgerVerify: Ref<boolean>;
  readonly stakeInput: Ref<StakeTokensInput | null>;
  readonly transactionState: Ref<string>;
  readonly transferInput: Ref<TransferTokensInput | null>;
  readonly transactionFee: Ref<AmountT | null>;
  readonly tokenBalances: Ref<TokenBalances | null>;
  readonly transactionHistory: Ref<TransactionHistory>;
  readonly transactionErrorMessage: Ref<string | null>;
  readonly walletHasLoaded: ComputedRef<boolean>;
  readonly pendingTransactions: Ref<Array<PendingTransaction>>;
  readonly canGoBack: ComputedRef<boolean>;
  readonly canGoNext: Ref<boolean>;
  readonly loadingHistory: Ref<boolean>;

  accountNameFor: (address: AccountAddressT) => string;
  accountRenamed: (newName: string) => void;
  addAccount: () => void;
  cancelTransaction: () => void;
  confirmTransaction: () => void;
  connectHardwareWallet: () => void;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  reloadSubscriptions: () => void;
  decryptMessage: (tx: ExecutedTransaction) => void;
  deleteLocalHardwareAddress: () => void;
  initWallet: () => void;
  loginWithWallet: (password: string) => Promise<RadixT>;
  nextPage: () => void;
  networkSwitched: () => Promise<void>;
  persistNodeUrl: (url: string) => Promise<void>;
  previousPage: () => void;
  refreshHistory: () => void;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
  setPin: (pin: string) => Promise<string>;
  setWallet: (newWallet: WalletT) => WalletT;
  setActiveTransactionForm: (val: string) => void;
  stakeTokens: (input: StakeTokensInput) => void;
  switchAccount: (account: AccountT) => void;
  transferTokens: (input: TransferTokensInput, message: MessageInTransaction, sc: TokenBalance) => void;
  unstakeTokens: (input: UnstakeTokensInput) => void;
  verifyHardwareWalletAddress: () => void;
  walletLoaded: () => void;
  waitUntilAllLoaded: () => Promise<any>;
}

export default function useWallet (radix: RadixT, router: Router): useWalletInterface {
  const invalidPasswordError: Ref<WalletError | null> = ref(null)

  radix.errors
    .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
    .subscribe((errorNotification: ErrorT<'wallet'>) => { invalidPasswordError.value = errorNotification })

  hasKeystore().then((res: boolean) => { hasWallet.value = res })

  const walletLoaded = () => {
    radix.__wallet.subscribe((newWallet: WalletT) => { wallet.value = newWallet })

    radix
      .withTokenBalanceFetchTrigger(interval(60 * 1_000))
      .withStakingFetchTrigger(interval(60 * 1_000))
  }

  const allLoadedObservable = zip(
    radix.tokenBalances,
    radix.activeAccount,
    radix.stakingPositions,
    radix.accounts,
    radix.activeAddress,
    radix.unstakingPositions,
    radix.ledger.nativeToken()
  )

  const waitUntilAllLoaded = async () => firstValueFrom(allLoadedObservable)

  const reloadSubscriptions = () => reloadTrigger.next(Math.random())

  const initWallet = (): void => {
    subs.add(reloadTrigger.asObservable().subscribe((val) => { console.log('got network change', val) }))

    subs.add(radix.ledger.nativeToken().subscribe((nativeTokenRes: Token) => { nativeToken.value = nativeTokenRes }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.tokenBalances))
      .subscribe((tokenBalancesRes: TokenBalances) => {
        tokenBalances.value = tokenBalancesRes
        console.log('getting token balances', tokenBalancesRes)
      }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.activeAccount))
      .subscribe((account: AccountT) => {
        activeAccount.value = account
        console.log('getting active account', account)
      }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.stakingPositions))
      .subscribe((stakes: StakePositions) => {
        activeStakes.value = stakes
        console.log('getting active stakes', stakes)
      }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.accounts))
      .subscribe((accountsRes: AccountsT) => {
        accounts.value = accountsRes
        console.log('getting accounts', accountsRes)
      }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.activeAddress))
      .subscribe((addressRes: AccountAddressT) => {
        activeAddress.value = addressRes
        console.log('getting active address', addressRes)
      }))

    subs.add(reloadTrigger.asObservable()
      .pipe(switchMap(() => radix.unstakingPositions))
      .subscribe((unstakes: UnstakePositions) => {
        activeUnstakes.value = unstakes
        console.log('getting unstakes', unstakes)
      }))

    reloadSubscriptions()
    refreshHistory()

    const fetchNativeTokenBalanceTrigger = combineLatest<[TokenBalances, Token]>([
      radix.tokenBalances,
      radix.ledger.nativeToken()
    ])

    subs.add(fetchNativeTokenBalanceTrigger
      .subscribe(([tokenBalancesRes, nativeTokenRes]: [TokenBalances, Token]) => {
        if (nativeTokenRes && tokenBalancesRes.tokenBalances && tokenBalancesRes.tokenBalances.length > 0) {
          nativeTokenBalance.value = tokenBalancesRes.tokenBalances.find((tb: TokenBalance) => tb.token.rri.equals(nativeTokenRes.rri)) || null
        } else {
          nativeTokenBalance.value = null
        }
      }))

    getDerivedAccountsIndex()
      .then((accountsIndex: string) => {
        if ((Number(accountsIndex)) > 0) {
          radix.restoreLocalHDAccountsToIndex(Number(accountsIndex) + 1)
            .subscribe(
              (accountsRes: AccountsT) => { accounts.value = accountsRes })
        } else {
          saveDerivedAccountsIndex(0)
        }
      })

    getAccountNames().then((names) => {
      accountNames.value = names
    })
  }

  const networkSwitched = async () => {
    // // subs.unsubscribe()
    // if (!accounts.value) return
    // const account = accounts.value.all[0] as AccountT
    // switchAccount(account)
    // initWallet()
    console.warn('#######################')

    const allReloaded = zip(
      radix.tokenBalances,
      radix.activeAccount,
      radix.stakingPositions,
      radix.accounts,
      radix.activeAddress,
      radix.unstakingPositions,
      radix.ledger.nativeToken()
    )
    const allDone = await firstValueFrom(allReloaded)
    console.log('allDone', allDone)
  }

  // Fetch history when user navigates to next page
  subs.add(historyPagination.asObservable()
    .pipe(
      mergeMap((params: TransactionHistoryOfKnownAddressRequestInput) =>
        radix.transactionHistory(params).pipe(retry())
      )
    )
    .subscribe((history: TransactionHistory) => {
      loadingHistory.value = false
      loadingHistoryPage.value = false
      if (history.cursor && history.transactions.length === PAGE_SIZE) canGoNext.value = true
      else canGoNext.value = false
      transactionHistory.value = history
    }))

  const addAccount = () => {
    getDerivedAccountsIndex()
      .then((index: string) => {
        saveDerivedAccountsIndex(Number(index) + 1)
        tokenBalances.value = null
        radix.deriveNextAccount({ alsoSwitchTo: true })
      })
  }

  const switchAccount = (account: AccountT) => {
    tokenBalances.value = null
    decryptedMessages.value = []
    radix.switchAccount({ toAccount: account })
  }

  const accountNameFor = (accountAddress: AccountAddressT): string => {
    const accountName = accountNames.value.find((accountName: AccountName) => accountAddress.toString() === accountName.address)
    return accountName ? accountName.name : ''
  }

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

  const confirmTransaction = () => {
    if (activeAccount.value &&
    hardwareAccount.value &&
    activeAccount.value === hardwareAccount.value) {
      transactionState.value = 'hw-signing'
    }
    userDidConfirm.next(true)
    hasCalculatedFee.value = false
  }

  const cancelTransaction = () => {
    userDidCancel.next(true)
    hasCalculatedFee.value = false
  }

  const setActiveTransactionForm = (val: string) => {
    activeTransactionForm.value = val
  }

  const confirmAndExecuteTransaction = (transactionTracking: TransactionTracking) => {
    activeTransaction.value = transactionTracking
    const transactionDidComplete = new BehaviorSubject<boolean>(false)
    userDidCancel.next(false)
    transactionState.value = 'building'
    shouldShowConfirmation.value = true
    // Subscribe to initial userConfirmation and display modal
    const createUserConfirmation = userConfirmation
      .subscribe((txnToConfirm: ManualUserConfirmTX) => {
        transactionToConfirm.value = txnToConfirm
        userDidConfirm.next(false)
        transactionState.value = 'confirm'
        transactionFee.value = txnToConfirm.txToConfirm.fee
        hasCalculatedFee.value = true
      })
    subs.add(createUserConfirmation)

    // Confirm transaction and move user to history view after they press confirm
    const watchUserDidConfirm = combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
      .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
        if (didConfirm) { txnToConfirm.confirm() }
      })
    subs.add(watchUserDidConfirm)

    // Catch errors that were silently failing
    const trackingSubmittedEventErrors = transactionTracking.events
      .pipe(filter((trackingEvent: TransactionStateUpdate) => {
        const errorEvent: TransactionStateError = trackingEvent as TransactionStateError
        return errorEvent && errorEvent.error != null
      }))
      .subscribe((event: TransactionStateUpdate) => {
        const errorEvent: TransactionStateError = event as TransactionStateError
        userDidCancel.next(true)
        shouldShowConfirmation.value = false
        const isLedgerConnectedError = errorEvent.error.message && errorEvent.error.message.includes('Failed to sign tx with Ledger')
        if (isLedgerConnectedError) {
          ledgerTxError.value = errorEvent.error
          hardwareAccount.value = null
          hardwareInteractionState.value = 'FAILED_TO_SIGN'
          hardwareError.value = new Error('validations.failedToSign')
          transactionErrorMessage.value = null
          return
        }

        transactionErrorMessage.value = `validations.${activeTransactionForm.value}Failed`
      })

    subs.add(trackingSubmittedEventErrors)

    // Store draft transaction actions
    subs.add(transactionTracking.events
      .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'INITIATED'))
      .subscribe((res: TransactionStateUpdate) => {
        draftTransaction.value = (res as TransactionStateSuccess).transactionState as TransactionIntent
      }))

    // Track pending transactions augmented with actions array
    const trackingSubmittedEvents = transactionTracking.events
      .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'SUBMITTED'))
      .subscribe((res: TransactionStateUpdate) => {
        const finalizedTransaction = res as unknown as TransactionStateSuccess
        pendingTransactions.value = pendingTransactions.value.concat([{
          ...finalizedTransaction,
          actions: draftTransaction.value ? draftTransaction.value.actions : []
        }])
        draftTransaction.value = null
        transactionState.value = 'submitting'
      })
    subs.add(trackingSubmittedEvents)

    // When a transaction has been completed, remove it from pending transactions
    subs.add(transactionTracking.completion
      .subscribe({
        next: (txnID: TransactionIdentifierT) => {
          pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: TransactionStateSuccess) => {
            const transactionState = pendingTxn.transactionState as unknown as FinalizedTransaction
            return txnID.toString() !== transactionState.txID.toString()
          })
          shouldShowConfirmation.value = false
          router.push('/wallet/history')
          hasCalculatedFee.value = false
          transactionDidComplete.next(true)
        }
      }))

    // Cleanup subscriptions on cancel and complete
    const cleanupTransactionSubs = () => {
      userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
      createUserConfirmation.unsubscribe()
      watchUserDidConfirm.unsubscribe()
      trackingSubmittedEvents.unsubscribe()
      hasCalculatedFee.value = false
      transactionErrorMessage.value = null
    }

    userDidCancel.subscribe((didCancel: boolean) => {
      if (didCancel) {
        cleanupTransactionSubs()
        shouldShowConfirmation.value = false
        activeMessage.value = ''
        hasCalculatedFee.value = false
      }
    })

    subs.add(transactionDidComplete.subscribe((didComplete: boolean) => {
      if (didComplete) {
        cleanupTransactionSubs()
        activeMessage.value = ''
        hasCalculatedFee.value = false
        historyPagination.next({ size: PAGE_SIZE })
      }
    }))
  }

  const cleanupInputs = () => {
    transferInput.value = null
    stakeInput.value = null
  }

  // call transferTokens() with built options and subscribe to confirmation and results
  const transferTokens = (transferTokensInput: TransferTokensInput, message: MessageInTransaction, sc: TokenBalance) => {
    let pollTXStatusTrigger: Observable<unknown>
    cleanupInputs()
    transferInput.value = transferTokensInput
    selectedCurrency.value = sc
    activeMessage.value = message.plaintext
    activeMessageInTransaction.value = message
    confirmationMode.value = 'transfer'
    const buildTransferTokens = (): TransferTokensOptions => ({
      transferInput: transferTokensInput,
      userConfirmation: userConfirmation,
      pollTXStatusTrigger: pollTXStatusTrigger
    })

    const transactionTracking: TransactionTracking = radix.transferTokens({
      ...buildTransferTokens(),
      userConfirmation,
      message
    })

    confirmAndExecuteTransaction(transactionTracking)
  }

  // call stakeTokens() with built options and subscribe to confirmation and results
  const stakeTokens = (stakeTokensInput: StakeTokensInput) => {
    let pollTXStatusTrigger: Observable<unknown>
    cleanupInputs()
    stakeInput.value = stakeTokensInput
    selectedCurrency.value = nativeTokenBalance.value
    confirmationMode.value = 'stake'

    const buildTransferTokens = (): StakeOptions => ({
      stakeInput: stakeTokensInput,
      userConfirmation: userConfirmation,
      pollTXStatusTrigger: pollTXStatusTrigger
    })

    const stakingTransactionTracking: TransactionTracking = radix.stakeTokens({
      ...buildTransferTokens(),
      userConfirmation
    })

    confirmAndExecuteTransaction(stakingTransactionTracking)
  }

  // call unstakeTokens() with built options and subscribe to confirmation and results
  const unstakeTokens = (unstakeTokensInput: UnstakeTokensInput) => {
    let pollTXStatusTrigger: Observable<unknown>
    cleanupInputs()
    stakeInput.value = unstakeTokensInput
    selectedCurrency.value = nativeTokenBalance.value
    confirmationMode.value = 'unstake'

    const buildTransferTokens = (): UnstakeOptions => ({
      unstakeInput: unstakeTokensInput,
      userConfirmation: userConfirmation,
      pollTXStatusTrigger: pollTXStatusTrigger
    })

    const unstakingTransactionTracking: TransactionTracking = radix.unstakeTokens({
      ...buildTransferTokens(),
      userConfirmation
    })

    confirmAndExecuteTransaction(unstakingTransactionTracking)
  }

  const refreshHistory = () => {
    loadingHistory.value = true
    historyPagination.next({ size: PAGE_SIZE })
  }

  const nextPage = () => {
    loadingHistoryPage.value = true
    cursorStack.value.push(transactionHistory.value.cursor)
    historyPagination.next({
      size: PAGE_SIZE,
      cursor: cursorStack.value[cursorStack.value.length - 1]
    })
  }

  const previousPage = () => {
    loadingHistoryPage.value = true
    cursorStack.value.pop()
    historyPagination.next({
      size: PAGE_SIZE,
      cursor: cursorStack.value.length > 0 ? cursorStack.value[cursorStack.value.length - 1] : ''
    })
  }

  const decryptMessage = (tx: ExecutedTransaction) => {
    firstValueFrom(radix.decryptTransaction(tx)).then((val) => {
      decryptedMessages.value.push({ id: tx.txID.toString(), message: val })
    })
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
        if (!hardwareAddress.value) {
          saveHardwareWalletAddress(hwAccount.address.toString())
          saveAccountName(hwAccount.address.toString(), 'Hardware Wallet')
          hardwareAddress.value = hwAccount.address.toString()
        }
        sidebar.value = 'default'
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
    deleteHardwareWalletAddress()
    hardwareAddress.value = ''
    showDeleteHWWalletPrompt.value = false
    hardwareAccount.value = null
  }

  const hashNodeUrl = async (url:string, account: AccountT): Promise<string> => {
    const hashedUrl = sha256Twice(url)
    const signed = account.signHash(hashedUrl)
    const signedHash = await firstValueFrom(signed)
    return signedHash.toDER()
  }

  const persistNodeUrl = async (url: string): Promise<void> => {
    if (!activeAccount.value) return
    const hash = await hashNodeUrl(url, activeAccount.value)
    const saveToStore = await persistNodeSelection(url, hash)
  }

  const fetchSavedNodeUrl = async (account: AccountT): Promise<string> => {
    const { selectedNode, selectedNodeHash } = await fetchSelectedNodeFromStore()
    if (!selectedNode) {
      // set a default node, one did not exist.
      const defaultToMainnet = 'https://mainnet.radixdlt.com'
      const hash = await hashNodeUrl(defaultToMainnet, account)
      const saveToStore = await persistNodeSelection(defaultToMainnet, hash)
      return defaultToMainnet
    }
    const rehash = await hashNodeUrl(selectedNode, account)

    if (rehash !== selectedNodeHash) throw new Error('Invalid Node Hash!')
    return selectedNode
  }

  return {
    accounts,
    activeAccount,
    activeAddress,
    activeMessageInTransaction,
    activeTransactionForm,
    activeStakes,
    activeTransaction,
    activeUnstakes,
    confirmationMode,
    decryptedMessages,
    hardwareAccount,
    hardwareAddress,
    hardwareError,
    hardwareInteractionState,
    hasWallet,
    invalidPasswordError,
    ledgerTxError,
    ledgerVerifyError,
    nativeToken,
    nativeTokenBalance,
    selectedCurrency,
    shouldShowConfirmation,
    showDeleteHWWalletPrompt,
    showLedgerVerify,
    stakeInput,
    tokenBalances,
    transactionErrorMessage,
    transactionFee,
    transactionHistory,
    transactionState,
    transferInput,
    pendingTransactions,
    canGoNext,
    loadingHistory,
    reloadSubscriptions,
    walletHasLoaded: computed(() => {
      return activeAddress.value != null && activeStakes.value != null && activeUnstakes.value != null && tokenBalances.value != null && nativeToken.value != null
    }),
    canGoBack: computed(() => cursorStack.value.length > 0),

    async loginWithWallet (password: string) {
      const client = await radix.login(password, touchKeystore)
      const firstActive = await firstValueFrom(client.activeAccount)
      const url = await fetchSavedNodeUrl(firstActive)
      const connected = await client.connect(url)
      nodeUrl.value = url
      initWallet()
      const loaded = await waitUntilAllLoaded()
      return client
    },

    resetWallet: (nextRoute = 'create-wallet') => {
      hasWallet.value = false
      resetStore()
      router.push(`/${nextRoute}`)
    },
    accountNameFor,
    accountRenamed,
    addAccount,
    cancelTransaction,
    confirmTransaction,
    connectHardwareWallet,
    createWallet,
    decryptMessage,
    deleteLocalHardwareAddress,
    initWallet,
    nextPage,
    networkSwitched,
    persistNodeUrl,
    previousPage,
    refreshHistory,
    setActiveTransactionForm,
    setPin,
    setWallet,
    stakeTokens,
    switchAccount,
    transferTokens,
    unstakeTokens,
    verifyHardwareWalletAddress,
    waitUntilAllLoaded,
    walletLoaded
  }
}
