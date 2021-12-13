import { computed, ComputedRef, ref, Ref } from 'vue'
import {
  combineLatest,
  firstValueFrom,
  interval,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
  timer
} from 'rxjs'
import { catchError, mergeMap, retryWhen, take, delayWhen, tap, filter, mapTo } from 'rxjs/operators'
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
  TransactionTrackingEventType,
  TransactionStateUpdate
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
  readonly transactionError: Ref<Error | null>;
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
const transactionSubs = new Subscription()

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

// can be building, confirm, submitting
const transactionState: Ref<string> = ref('confirm')
const transactionError: Ref<Error | null> = ref(null)
const userDidConfirm = new Subject<boolean>()
const userDidCancel = new Subject<boolean>()
const userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()

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

  // Fetch history when user navigates to next page and every 15 seconds
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

  // Cleanup subscriptions on cancel and complete
  const cleanupTransactionSubs = () => {
    transactionErrorMessage.value = null
    // To Do: Where in the flow can we safely unsubscvribe from these txns?
    // Unsubscribing here breaks further transactions
    // transactionSubs.unsubscribe()
  }

  userDidCancel.subscribe((didCancel: boolean) => {
    if (didCancel) {
      cleanupTransactionSubs()
      shouldShowConfirmation.value = false
      activeMessage.value = ''
    }
  })

  const confirmTransaction = () => {
    if (activeAccount && hardwareAccount && activeAccount === hardwareAccount) {
      // To Do: Tell the ledger to confirm txn
      transactionState.value = 'hw-signing'
    }
    userDidConfirm.next(true)
  }

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

  // After a transaction is completed, cleanup subs and input fields.
  // Navigate user to history view
  const handleTransactionCompleted = () => {
    shouldShowConfirmation.value = false
    cleanupTransactionSubs()
    activeMessage.value = ''

    router.push('/wallet/history')
  }

  // Handle information returned from lifecycle event for Transfer, Stake, and Unstake actions
  //  - update transactionState for confirmation modal
  //  - update fee to display to the user
  //  - handle error if it is returned
  const handleTransactionLifecycleEvent = (txState: TransactionStateUpdate) => {
    transactionState.value = txState.eventUpdateType
    // To Do:
    // Add pending transactions to list

    const t: any = txState
    if (t.transactionState && t.transactionState.fee) transactionFee.value = t.transactionState.fee
    if (t.error) {
      cancelTransaction()
      setError(t.error)
    }
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
      pollTXStatusTrigger: interval(1000),
      message
    })
    userDidConfirm.next(false)
    shouldShowConfirmation.value = true

    transactionSubs.add(completion.subscribe(handleTransactionCompleted))
    transactionSubs.add(events.subscribe(handleTransactionLifecycleEvent))
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

    transactionSubs.add(completion.subscribe(handleTransactionCompleted))
    transactionSubs.add(events.subscribe(handleTransactionLifecycleEvent))
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

    transactionSubs.add(completion.subscribe(handleTransactionCompleted))
    transactionSubs.add(events.subscribe(handleTransactionLifecycleEvent))
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
    transactionError,
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
