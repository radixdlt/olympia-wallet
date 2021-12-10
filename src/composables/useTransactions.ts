import { computed, ComputedRef, ref, Ref } from 'vue'
import {
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
import { catchError, mergeMap, retryWhen, take, delayWhen, tap, filter } from 'rxjs/operators'
import {
  AmountT,
  ExecutedTransaction,
  IntendedAction,
  ManualUserConfirmTX,
  MessageInTransaction,
  Radix,
  StakeOptions,
  StakeTokensInput,
  TokenBalance,
  TransactionHistory,
  TransactionHistoryOfKnownAddressRequestInput,
  TransactionIntent,
  TransactionStateSuccess,
  TransactionTracking,
  TransferTokensInput,
  TransferTokensOptions,
  UnstakeOptions,
  UnstakeTokensInput,
  AccountT,
  TransactionTrackingEventType
} from '@radixdlt/application'
import { Router } from 'vue-router'
import { useErrors } from '.'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'
import { fetchSelectedNode } from '@/actions/electron/data-store'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

interface useTransactionsInterface {
  readonly activeMessageInTransaction: Ref<MessageInTransaction | null>;
  readonly activeTransaction: Ref<TransactionTracking | null>;
  readonly activeTransactionForm: Ref<string | null>;
  readonly confirmationMode: Ref<string | null>;
  readonly decryptedMessages: Ref<{id: string, message: string}[]>;
  readonly selectedCurrency: Ref<Decoded.TokenAmount | null>;
  readonly shouldShowConfirmation: Ref<boolean>;
  readonly stakeInput: Ref<StakeTokensInput | null>;
  readonly unstakeInput: Ref<UnstakeTokensInput | null>;
  readonly transactionState: Ref<string>;
  readonly transferInput: Ref<TransferTokensInput | null>;
  readonly transactionFee: Ref<AmountT | null>;
  readonly transactionHistory: Ref<TransactionHistory>;
  readonly transactionErrorMessage: Ref<string | null>;
  readonly pendingTransactions: Ref<Array<TransactionIntent>>;
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
  transferTokens: (input: TransferTokensInput, message: MessageInTransaction, sc: Decoded.TokenAmount) => void;
  unstakeTokens: (input: UnstakeTokensInput) => void;
  transactionUnsub: () => void;
}

const subs = new Subscription()

const PAGE_SIZE = 30

const activeMessage: Ref<string> = ref('')
const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
const activeTransaction: Ref<TransactionTracking | null> = ref(null)
const activeTransactionForm: Ref<string | null> = ref(null)
const ledgerTxError: Ref<Error | null> = ref(null)
const loadingHistory: Ref<boolean> = ref(true)
const loadingHistoryPage: Ref<boolean> = ref(true)

const selectedCurrency: Ref<Decoded.TokenAmount | null> = ref(null)
const shouldShowConfirmation: Ref<boolean> = ref(false)
const canGoNext: Ref<boolean> = ref(false)
const confirmationMode: Ref<string | null> = ref(null)
const cursorStack: Ref<string[]> = ref([])
const decryptedMessages: Ref<{id: string, message: string}[]> = ref([])
const draftTransaction: Ref<TransactionIntent | null> = ref(null)
const pendingTransactions: Ref<PendingTransaction[]> = ref([])
const stakeInput: Ref<StakeTokensInput | null> = ref(null)
const unstakeInput: Ref<UnstakeTokensInput | null> = ref(null)
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

export default function useTransactions (radix: ReturnType<typeof Radix.create>, router: Router, activeAccount: AccountT | null, hardwareAccount: AccountT | null): useTransactionsInterface {
  const { setError } = useErrors(radix)
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
    interval(15 * 1_000)
  ])
  let tries = 0
  // Fetch history when user navigates to next page
  const historySub = fetchTXHistoryTrigger
    .pipe(
      mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) =>
        radix.transactionHistory(params).pipe(
          retryWhen(error => error.pipe(
            tap(() => tries++),
            delayWhen(() => timer(100 * 2 ** tries)),
            take(1),
            catchError(e => of(e))
          )),
          tap(() => { tries = 0 })
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

  // Confirm transaction and move user to history view after they press confirm
  const watchUserDidConfirm = combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
    .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
      if (didConfirm) { txnToConfirm.confirm() }
    })
  subs.add(watchUserDidConfirm)

  // Cleanup subscriptions on cancel and complete
  const cleanupTransactionSubs = () => {
    userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
    watchUserDidConfirm.unsubscribe()
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

  const confirmTransaction = () => {
    if (activeAccount && hardwareAccount && activeAccount === hardwareAccount) {
      // To Do: Tell the ledger to confirm txn
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
  // let activeTransactionSubs = new Subscription()
  // const confirmAndExecuteTransaction = (transactionTracking) => {
  //   activeTransactionSubs.unsubscribe()
  //   activeTransactionSubs = new Subscription()
  //   activeTransaction.value = transactionTracking
  //   const transactionDidComplete = new BehaviorSubject<boolean>(false)
  //   userDidCancel.next(false)
  //   transactionState.value = 'building'
  //   shouldShowConfirmation.value = true
  //   transactionErrorMessage.value = null
  // // Subscribe to initial userConfirmation and display modal
  // const createUserConfirmation = userConfirmation
  //   .subscribe((txnToConfirm: ManualUserConfirmTX) => {
  //     transactionToConfirm.value = txnToConfirm
  //     userDidConfirm.next(false)
  //     transactionState.value = 'confirm'
  //     transactionFee.value = txnToConfirm.txToConfirm.fee
  //     hasCalculatedFee.value = true
  //   })
  //   subs.add(createUserConfirmation)
  //   activeTransactionSubs.add(createUserConfirmation)

  // // Confirm transaction and move user to history view after they press confirm
  // const watchUserDidConfirm = combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
  //   .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
  //     if (didConfirm) { txnToConfirm.confirm() }
  //   })
  // subs.add(watchUserDidConfirm)
  //   activeTransactionSubs.add(watchUserDidConfirm)

  //   // Catch errors that were silently failing
  //   const trackingSubmittedEventErrors = transactionTracking.events
  //     .pipe(filter((trackingEvent: TransactionStateUpdate) => {
  //       const errorEvent: TransactionStateError = trackingEvent as TransactionStateError
  //       return errorEvent && errorEvent.error != null
  //     }))
  //     .subscribe((event: TransactionStateUpdate) => {
  //       const errorEvent: TransactionStateError = event as TransactionStateError
  //       const transactionStateConstant: TransactionStateT = transactionState.value.toUpperCase() as TransactionStateT
  //       setError({
  //         type: 'TRANSACTION-' + transactionStateConstant as ClientAppErrorTypeT,
  //         error: errorEvent.error
  //       })

  //       // const errorEvent: TransactionStateError = event as TransactionStateError
  //       userDidCancel.next(true)
  //       shouldShowConfirmation.value = false
  //       const isLedgerConnectedError = errorEvent.error.message && errorEvent.error.message.includes('Failed to sign tx with Ledger')
  //       if (isLedgerConnectedError) {
  //         ledgerTxError.value = errorEvent.error
  //         transactionErrorMessage.value = null
  //         return
  //       }

  //       transactionErrorMessage.value = `validations.${activeTransactionForm.value}Failed`
  //     })

  //   subs.add(trackingSubmittedEventErrors)
  //   activeTransactionSubs.add(trackingSubmittedEventErrors)

  //   // Store draft transaction actions
  //   const draftTransactionSub = transactionTracking.events
  //     .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'INITIATED'))
  //     .subscribe((res: TransactionStateUpdate) => {
  //       draftTransaction.value = (res as TransactionStateSuccess).transactionState as TransactionIntent
  //     })
  //   subs.add(draftTransactionSub)
  //   activeTransactionSubs.add(draftTransactionSub)

  //   // Track pending transactions augmented with actions array
  //   const trackingSubmittedEvents = transactionTracking.events
  //     .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'SUBMITTED'))
  //     .subscribe((res: TransactionStateUpdate) => {
  //       const finalizedTransaction = res as unknown as TransactionStateSuccess
  //       pendingTransactions.value = pendingTransactions.value.concat([{
  //         ...finalizedTransaction,
  //         actions: draftTransaction.value ? draftTransaction.value.actions : []
  //       }])
  //       draftTransaction.value = null
  //       transactionState.value = 'submitting'
  //     })
  //   subs.add(trackingSubmittedEvents)
  //   activeTransactionSubs.add(trackingSubmittedEvents)

  //   // When a transaction has been completed, remove it from pending transactions
  //   const transactionCompleteSub = transactionTracking.completion
  //     .subscribe({
  //       next: (txnID: TransactionIdentifierT) => {
  //         pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: TransactionStateSuccess) => {
  //           const transactionState = pendingTxn.transactionState as unknown as FinalizedTransaction
  //           return false
  //           // return txnID.toString() !== transactionState.txID.toString()
  //         })
  //         shouldShowConfirmation.value = false
  //         router.push('/wallet/history')
  //         hasCalculatedFee.value = false
  //         transactionDidComplete.next(true)
  //         // If we receive a completion event but never received a confirmation event and cleared
  //         // pending transaction, we should warn the user that something went wrong
  //         if (transactionState.value !== 'submitting') {
  //           setError({
  //             type: 'TRANSACTION-CONFIRM'
  //           })
  //         }
  //       }
  //     })
  //   subs.add(transactionCompleteSub)
  //   activeTransactionSubs.add(transactionCompleteSub)

  //   subs.add(transactionDidComplete.subscribe((didComplete: boolean) => {
  //     if (didComplete) {
  //       cleanupTransactionSubs()
  //       activeMessage.value = ''
  //       hasCalculatedFee.value = false
  //       historyPagination.next({ size: PAGE_SIZE })
  //     }
  //   }))
  // }

  const cleanupInputs = () => {
    transferInput.value = null
    stakeInput.value = null
    unstakeInput.value = null
  }

  // call transferTokens() with built options and subscribe to confirmation and results
  const transferTokens = (transferTokensInput: TransferTokensInput, message: MessageInTransaction, sc: Decoded.TokenAmount) => {
    cleanupInputs()
    transferInput.value = transferTokensInput
    selectedCurrency.value = sc
    activeMessage.value = message.plaintext
    activeMessageInTransaction.value = message
    confirmationMode.value = 'transfer'

    const { events, completion } = radix.transferTokens({
      transferInput: transferTokensInput,
      userConfirmation,
      pollTXStatusTrigger: interval(500),
      message
    })

    userDidConfirm.next(false)
    shouldShowConfirmation.value = true

    subs.add(completion.subscribe(txID => {
      shouldShowConfirmation.value = false
      router.push('/wallet/history')
    }))

    subs.add(events.subscribe(txState => {
      transactionState.value = txState.eventUpdateType
      // To Do:
      // Cleanup subscription after completed event
      // Add pending transactions to list

      const t: any = txState
      if (t.transactionState && t.transactionState.fee) transactionFee.value = t.transactionState.fee
      // if (t.transactionState && t.transactionState.actions) draftTransaction.value = t.transactionState
    }))
  }

  // call unstakeTokens() with built options and subscribe to confirmation and results
  const unstakeTokens = async (unstakeTokensInput: UnstakeTokensInput) => {
    cleanupInputs()
    unstakeInput.value = unstakeTokensInput
    confirmationMode.value = 'unstake'

    const { completion, events } = await radix.unstakeTokens({
      unstakeInput: unstakeTokensInput,
      userConfirmation,
      pollTXStatusTrigger: interval(1000)
    })

    userDidConfirm.next(false)
    shouldShowConfirmation.value = true

    subs.add(completion.subscribe(() => {
      shouldShowConfirmation.value = false
      router.push('/wallet/history')
    }))

    subs.add(events.subscribe(txState => {
      transactionState.value = txState.eventUpdateType

      const t: any = txState
      if (t.transactionState && t.transactionState.fee) transactionFee.value = t.transactionState.fee
    }))
  }

  // call stakeTokens() with built options and subscribe to confirmation and results
  const stakeTokens = async (stakeTokensInput: StakeTokensInput) => {
    cleanupInputs()
    stakeInput.value = stakeTokensInput
    confirmationMode.value = 'stake'

    const { completion, events } = await radix.stakeTokens({
      stakeInput: stakeTokensInput,
      userConfirmation,
      pollTXStatusTrigger: interval(1000)
    })

    userDidConfirm.next(false)
    shouldShowConfirmation.value = true

    subs.add(completion.subscribe(() => {
      shouldShowConfirmation.value = false
      router.push('/wallet/history')
    }))

    subs.add(events.subscribe(txState => {
      transactionState.value = txState.eventUpdateType

      const t: any = txState
      if (t.transactionState && t.transactionState.fee) transactionFee.value = t.transactionState.fee
    }))
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
    unstakeInput,
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
