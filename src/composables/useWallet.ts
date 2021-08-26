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

import { Router } from 'vue-router'
import { Subscription, interval, Subject, Observable, combineLatest, BehaviorSubject, ReplaySubject, firstValueFrom, zip } from 'rxjs'
import { filter, mergeMap, retry } from 'rxjs/operators'
import { touchKeystore, hasKeystore, initWallet, storePin } from '@/actions/vue/create-wallet'
import {
  deleteHardwareWalletAddress,
  getDerivedAccountsIndex,
  getHardwareWalletAddress,
  resetStore,
  saveAccountName,
  saveDerivedAccountsIndex,
  saveHardwareWalletAddress
} from '@/actions/vue/data-store'

import { sendAPDU } from '@/actions/vue/hardware-wallet'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

export type WalletError = ErrorT<ErrorCategory.WALLET>

const accounts: Ref<AccountsT | null> = ref(null)
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

// a dirty trick to get the account list item in the default wallet sidebar when the name changes
const accountNameIndex: Ref<number> = ref(0)
const loadingHistory: Ref<boolean> = ref(true)
const loadingHistoryPage: Ref<boolean> = ref(true)

// can be building, confirm, submitting
const transactionState: Ref<string> = ref('confirm')

const hardwareInteractionState: Ref<string> = ref('')

const userDidConfirm = new Subject<boolean>()
const userDidCancel = new Subject<boolean>()
let userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()

const hardwareAddress: Ref<string> = ref('')
const hardwareWalletError: Ref<Error | null> = ref(null)
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

  accountRenamed: () => void;
  addAccount: () => void;
  cancelTransaction: () => void;
  confirmTransaction: () => void;
  connectHardwareWallet: () => void;
  createWallet: (mnemonic: MnemomicT, pass: string, network: Network) => Promise<WalletT>;
  decryptMessage: (tx: ExecutedTransaction) => void;
  deleteLocalHardwareAddress: () => void;
  initWallet: () => void;
  isActiveAccount: (account: AccountT) => boolean;
  loginWithWallet: (password: string) => Promise<RadixT>;
  nextPage: () => void;
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
    radix.__wallet.subscribe((newWallet: WalletT) => {
      wallet.value = newWallet
      router.push('/wallet')
    })

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

  const initWallet = (): void => {
    subs.add(radix.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes }))
    subs.add(radix.activeAccount.subscribe((account: AccountT) => { activeAccount.value = account }))
    subs.add(radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes }))
    subs.add(radix.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }))
    subs.add(radix.activeAddress.subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))
    subs.add(radix.unstakingPositions.subscribe(unstakes => { activeUnstakes.value = unstakes }))
    subs.add(radix.ledger.nativeToken().subscribe((nativeTokenRes: Token) => { nativeToken.value = nativeTokenRes }))

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
  }
  // Fetch history when user navigates to next page and every 5 seconds
  const fetchTXHistoryTrigger = combineLatest<[TransactionHistoryOfKnownAddressRequestInput, number]>([
    historyPagination.asObservable(),
    interval(60 * 1_000)
  ])

  subs.add(fetchTXHistoryTrigger
    .pipe(
      mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) => {
        return radix.transactionHistory(params).pipe(retry())
      })
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

  const accountRenamed = () => {
    router.push('/wallet')
    accountNameIndex.value = accountNameIndex.value + 1
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
          hardwareWalletError.value = new Error('validations.failedToSign')
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
          router.push('/wallet')
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

  historyPagination.next({ size: PAGE_SIZE })

  const refreshHistory = () => {
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
    hardwareWalletError.value = null
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
      error: (err) => { hardwareWalletError.value = err }
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

  const isActiveAccount = (account: AccountT) => {
    const activeAccountKey: string = activeAccount.value?.hdPath ? activeAccount.value?.hdPath.toString() : 'active'
    const accountKey: string = account.hdPath ? account.hdPath.toString() : 'account'
    return activeAccountKey === accountKey
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
    walletHasLoaded: computed(() => {
      return activeAddress.value != null && activeStakes.value != null && activeUnstakes.value != null && tokenBalances.value != null && nativeToken.value != null
    }),

    async loginWithWallet (password: string) {
      const client = await radix.login(password, touchKeystore)
      initWallet()
      const loaded = await waitUntilAllLoaded()
      return client
    },

    resetWallet: (nextRoute = 'create-wallet') => {
      hasWallet.value = false
      resetStore()
      router.push(`/${nextRoute}`)
    },

    accountRenamed,
    addAccount,
    cancelTransaction,
    confirmTransaction,
    connectHardwareWallet,
    createWallet,
    decryptMessage,
    deleteLocalHardwareAddress,
    initWallet,
    isActiveAccount,
    nextPage,
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
