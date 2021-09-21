import { computed, ComputedRef, ref, Ref } from 'vue'
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  interval,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
  timer
} from 'rxjs'
import { catchError, delay, mergeMap, retryWhen, take, filter, delayWhen, tap } from 'rxjs/operators'
import {
  AmountT,
  ExecutedTransaction,
  FinalizedTransaction,
  IntendedAction,
  ManualUserConfirmTX,
  MessageInTransaction,
  RadixT,
  StakeOptions,
  StakeTokensInput,
  TokenBalance,
  TransactionHistory,
  TransactionHistoryOfKnownAddressRequestInput,
  TransactionIntent,
  TransactionStateError,
  TransactionStateSuccess,
  TransactionStateUpdate,
  TransactionIdentifierT,
  TransactionTracking,
  TransferTokensInput,
  TransferTokensOptions,
  UnstakeOptions,
  UnstakeTokensInput,
  AccountT
} from '@radixdlt/application'
import { Router } from 'vue-router'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

interface useTransactionsInterface {
  readonly activeMessageInTransaction: Ref<MessageInTransaction | null>;
  readonly activeTransaction: Ref<TransactionTracking | null>;
  readonly activeTransactionForm: Ref<string | null>;
  readonly confirmationMode: Ref<string | null>;
  readonly decryptedMessages: Ref<{id: string, message: string}[]>;
  readonly selectedCurrency: Ref<TokenBalance | null>;
  readonly shouldShowConfirmation: Ref<boolean>;
  readonly stakeInput: Ref<StakeTokensInput | null>;
  readonly transactionState: Ref<string>;
  readonly transferInput: Ref<TransferTokensInput | null>;
  readonly transactionFee: Ref<AmountT | null>;
  readonly transactionHistory: Ref<TransactionHistory>;
  readonly transactionErrorMessage: Ref<string | null>;
  readonly pendingTransactions: Ref<Array<PendingTransaction>>;
  readonly canGoBack: ComputedRef<boolean>;
  readonly canGoNext: Ref<boolean>;
  readonly loadingHistory: Ref<boolean>;

  cancelTransaction: () => void;
  confirmTransaction: () => void;
  decryptMessage: (tx: ExecutedTransaction) => void;
  nextPage: () => void;
  previousPage: () => void;
  refreshHistory: () => void;
  setActiveTransactionForm: (val: string) => void;
  stakeTokens: (input: StakeTokensInput) => void;
  transferTokens: (input: TransferTokensInput, message: MessageInTransaction, sc: TokenBalance) => void;
  unstakeTokens: (input: UnstakeTokensInput) => void;
  transactionUnsub: () => void;
}

const subs = new Subscription()

const PAGE_SIZE = 50

const activeMessage: Ref<string> = ref('')
const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
const activeTransaction: Ref<TransactionTracking | null> = ref(null)
const activeTransactionForm: Ref<string | null> = ref(null)
const ledgerTxError: Ref<Error | null> = ref(null)
const loadingHistory: Ref<boolean> = ref(true)
const loadingHistoryPage: Ref<boolean> = ref(true)

const selectedCurrency: Ref<TokenBalance | null> = ref(null)
const shouldShowConfirmation: Ref<boolean> = ref(false)
const canGoNext: Ref<boolean> = ref(false)
const confirmationMode: Ref<string | null> = ref(null)
const cursorStack: Ref<string[]> = ref([])
const decryptedMessages: Ref<{id: string, message: string}[]> = ref([])
const draftTransaction: Ref<TransactionIntent | null> = ref(null)
const pendingTransactions: Ref<Array<PendingTransaction>> = ref([])
const stakeInput: Ref<StakeTokensInput | null> = ref(null)
const transactionErrorMessage: Ref<string | null> = ref(null)
const transactionFee: Ref<AmountT | null> = ref(null)
const transactionHistory: Ref<TransactionHistory> = ref({ transactions: [], cursor: '' })
const transactionToConfirm: Ref<ManualUserConfirmTX | null> = ref(null)
const transferInput: Ref<TransferTokensInput | null> = ref(null)
const hasCalculatedFee: Ref<boolean> = ref(false)

// can be building, confirm, submitting
const transactionState: Ref<string> = ref('confirm')
const userDidConfirm = new Subject<boolean>()
const userDidCancel = new Subject<boolean>()
let userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()

export default function useTransactions (radix: RadixT, router: Router, activeAccount: AccountT | null, hardwareAccount: AccountT | null, callbacks: { ledgerSigningError: () => void;}): useTransactionsInterface {
  const refreshHistory = () => {
    loadingHistory.value = true
    historyPagination.next({ size: PAGE_SIZE })
  }

  const canGoBack = computed(() => cursorStack.value.length > 0)

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

  // Fetch history when user navigates to next page and every 5 seconds
  const fetchTXHistoryTrigger = combineLatest<[TransactionHistoryOfKnownAddressRequestInput, number]>([
    historyPagination.asObservable(),
    interval(5 * 1_000)
  ])

  let tries = 0
  // Fetch history when user navigates to next page
  const historySub = fetchTXHistoryTrigger
    .pipe(
      mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) =>
        radix.transactionHistory(params).pipe(
          retryWhen(error => error.pipe(
            tap(_ => tries++),
            delayWhen(_ => timer(100 * 2 ** tries)),
            take(1),
            catchError(e => of(e))
          )),
          tap(_ => tries = 0)
        )
      )
    )
    .subscribe((history: TransactionHistory) => {
      loadingHistory.value = false
      loadingHistoryPage.value = false
      if (history.cursor && history.transactions.length === PAGE_SIZE) canGoNext.value = true
      else canGoNext.value = false
      transactionHistory.value = history
    })

  const confirmTransaction = () => {
    if (activeAccount && hardwareAccount && activeAccount === hardwareAccount) {
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
          callbacks.ledgerSigningError()
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

  // call unstakeTokens() with built options and subscribe to confirmation and results
  const unstakeTokens = (unstakeTokensInput: UnstakeTokensInput) => {
    let pollTXStatusTrigger: Observable<unknown>
    cleanupInputs()
    stakeInput.value = unstakeTokensInput
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

  // call stakeTokens() with built options and subscribe to confirmation and results
  const stakeTokens = (stakeTokensInput: StakeTokensInput) => {
    let pollTXStatusTrigger: Observable<unknown>
    cleanupInputs()
    stakeInput.value = stakeTokensInput
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

  const transactionUnsub = () => {
    historySub.unsubscribe()
    cursorStack.value = []
  }

  return {
    activeMessageInTransaction,
    activeTransaction,
    activeTransactionForm,
    confirmationMode,
    decryptedMessages,
    selectedCurrency,
    shouldShowConfirmation,
    stakeInput,
    transactionState,
    transferInput,
    transactionFee,
    transactionHistory,
    transactionErrorMessage,
    pendingTransactions,
    canGoBack,
    canGoNext,
    loadingHistory,

    cancelTransaction,
    confirmTransaction,
    decryptMessage,
    nextPage,
    previousPage,
    refreshHistory,
    setActiveTransactionForm,
    stakeTokens,
    transferTokens,
    transactionUnsub,
    unstakeTokens
  }
}
