import { ref, Ref } from 'vue'
import {
  interval,
  merge,
  ReplaySubject,
  Subject,
  Subscription
} from 'rxjs'
import { mergeMap, take, filter, mapTo } from 'rxjs/operators'
import {
  AccountT,
  AccountAddressT,
  AmountT,
  IntendedAction,
  ManualUserConfirmTX,
  MessageInTransaction,
  Radix,
  StakeTokensInput,
  TransactionIntent,
  TransactionStateSuccess,
  TransactionStateUpdate,
  TransactionTracking,
  TransferTokensInput,
  UnstakeTokensInput
} from '@radixdlt/application'
import { Router } from 'vue-router'
import { useErrors } from '.'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
}

interface useTransactionsInterface {
  readonly activeMessageInTransaction: Ref<MessageInTransaction | null>;
  readonly activeTransaction: Ref<TransactionTracking | null>;
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
  readonly pendingTransactions: Ref<Array<TransactionIntent>>;
  readonly shouldShowMaxUnstakeConfirmation: Ref<boolean>;

  cancelTransaction: () => void;
  confirmTransaction: () => void;
  setActiveTransactionForm: (val: string) => void;
  stakeTokens: (input: StakeTokensInput) => void;
  transferTokens: (input: TransferTokensInput, message: MessageInTransaction, sc: Decoded.TokenAmount) => void;
  unstakeTokens: (input: UnstakeTokensInput) => void;
}

const transactionSubs = new Subscription()

const activeMessage: Ref<string> = ref('')
const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
const activeTransaction: Ref<TransactionTracking | null> = ref(null)
const activeTransactionForm: Ref<string | null> = ref(null)

const selectedCurrency: Ref<Decoded.TokenAmount | null> = ref(null)
const shouldShowConfirmation: Ref<boolean> = ref(false)
const shouldShowMaxUnstakeConfirmation: Ref<boolean> = ref(false)
const confirmationMode: Ref<string | null> = ref(null)
const pendingTransactions: Ref<PendingTransaction[]> = ref([])
const stakeInput: Ref<StakeTokensInput | null> = ref(null)
const unstakeInput: Ref<UnstakeTokensInput | null> = ref(null)
const transactionErrorMessage: Ref<string | null> = ref(null)
const transactionFee: Ref<AmountT | null> = ref(null)
const transferInput: Ref<TransferTokensInput | null> = ref(null)

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

export default function useTransactions (radix: ReturnType<typeof Radix.create>, router: Router, activeAddress: AccountAddressT | null, hardwareAccount: AccountT | null): useTransactionsInterface {
  const { setError } = useErrors(radix)

  // Cleanup subscriptions on cancel and complete
  const cleanupTransactionSubs = () => {
    transactionErrorMessage.value = null
  }

  userDidCancel.subscribe((didCancel: boolean) => {
    if (didCancel) {
      cleanupTransactionSubs()
      shouldShowConfirmation.value = false
      shouldShowMaxUnstakeConfirmation.value = false
      activeMessage.value = ''
      ledgerState.value = ''
      transactionState.value = 'PENDING'
    }
  })

  const confirmTransaction = () => {
    if (activeAddress && hardwareAccount && activeAddress === hardwareAccount.address) {
      ledgerState.value = 'hw-signing'
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
    shouldShowMaxUnstakeConfirmation.value = false
    cleanupTransactionSubs()
    activeMessage.value = ''
    ledgerState.value = ''
    transactionState.value = 'PENDING'

    router.push(`/wallet/${activeAddress?.toString()}/history`)
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

  return {
    activeMessageInTransaction,
    activeTransaction,
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
    pendingTransactions,

    cancelTransaction,
    confirmTransaction,
    setActiveTransactionForm,
    stakeTokens,
    transferTokens,
    unstakeTokens
  }
}
