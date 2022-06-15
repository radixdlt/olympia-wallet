import { Radix, AccountAddressT, SimpleExecutedTransaction, ExecutedTransaction } from '@radixdlt/application'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { firstValueFrom, interval, Subscription } from 'rxjs'

const PAGE_SIZE = 30

const decryptedMessages: Ref<{id: string, message: string}[]> = ref([])
const cursorStack: Ref<string[]> = ref([])
const canGoBack: ComputedRef<boolean> = computed(() => cursorStack.value.length > 0)
const canGoNext: Ref<boolean> = ref(false)
const loadingHistory: Ref<boolean> = ref(true)

const activeCursor: Ref<string> = ref('')
const transactions: Ref<SimpleExecutedTransaction[]> = ref([])

const isDecrypting: Ref<boolean> = ref(false)
let transactionSub: Subscription | null

const activeAddress: Ref<AccountAddressT | null> = ref(null)
export default function useHistory (radix: ReturnType<typeof Radix.create>, address: AccountAddressT) {
  const fetchTransactions = async (cursor?: string) => {
    if (!activeAddress.value) return
    const params = { size: PAGE_SIZE, address: activeAddress.value, cursor }
    const data = await firstValueFrom(radix.ledger.transactionHistory(params))
    transactions.value = data.transactions
    loadingHistory.value = false
    activeCursor.value = data.cursor
    canGoNext.value = !!data.cursor && data.transactions.length === PAGE_SIZE
    if (!transactionSub) {
      transactionSub = interval(15000).subscribe(() => fetchTransactions(cursor))
    }
  }

  const cleanupTransactionSub = () => {
    if (transactionSub) {
      transactionSub.unsubscribe()
      transactionSub = null
    }
  }

  const resetHistory = () => {
    cleanupTransactionSub()
    loadingHistory.value = true
    cursorStack.value = []
    transactions.value = []
    decryptedMessages.value = []
    activeCursor.value = ''
  }

  const updateActiveAccount = (addr: AccountAddressT) => {
    activeAddress.value = addr
  }

  const decryptMessage = (client: ReturnType<typeof Radix.create>, tx: ExecutedTransaction) => {
    isDecrypting.value = true
    firstValueFrom(client.decryptTransaction(tx))
      .then((val) => {
        decryptedMessages.value.push({ id: tx.txID.toString(), message: val })
      })
      .finally(() => { isDecrypting.value = false })
  }

  const previousPage = () => {
    cleanupTransactionSub()
    loadingHistory.value = true
    cursorStack.value.pop()
    fetchTransactions(cursorStack.value.length > 0 ? cursorStack.value[cursorStack.value.length - 1] : '')
  }

  const nextPage = () => {
    cleanupTransactionSub()
    loadingHistory.value = true
    cursorStack.value.push(activeCursor.value)
    fetchTransactions(activeCursor.value)
  }

  const leavingHistory = () => {
    cleanupTransactionSub()
  }

  return {
    canGoBack,
    canGoNext,
    decryptedMessages,
    loadingHistory,
    transactions,
    decryptMessage,
    fetchTransactions,
    leavingHistory,
    nextPage,
    previousPage,
    resetHistory,
    isDecrypting,
    updateActiveAccount
  }
}
