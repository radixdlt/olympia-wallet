<template>
  <div data-ci="wallet-view" class="flex flex-row min-h-screen">
    <wallet-sidebar-default
      v-if="sidebar == 'default'"
      :activeAccount="activeAccount"
      :activeView="view"
      @open="sidebar = 'accounts'"
      @setView="setView"
    >
    </wallet-sidebar-default>

    <wallet-sidebar-accounts
      v-if="sidebar == 'accounts'"
      :accounts="accounts"
      :activeAccount="activeAccount"
      @back="sidebar = 'default'"
      @addAccount="addAccount"
      @switchAccount="switchAccount"
    >
    </wallet-sidebar-accounts>

    <template v-if="activeAddress">
      <wallet-overview
        v-if="view == 'overview'"
        :activeAddress="activeAddress"
        :activeStakes="activeStakes"
        :activeUnstakes="activeUnstakes"
        :tokenBalances="tokenBalances"
        :transactionHistory="transactionHistory"
      >
      </wallet-overview>

      <wallet-transaction
        v-if="view == 'transaction'"
        :activeAddress="activeAddress"
        :tokenBalances="tokenBalances"
        :shouldShowConfirmation="shouldShowConfirmation"
        @transferTokens="transferTokens"
      >

      </wallet-transaction>

      <wallet-history
        v-if="view == 'history'"
        :transactions="transactionHistory.transactions"
        :activeAddress="activeAddress"
        :pendingTransactions="pendingTransactions"
        :canGoBack="previousCursor !== ''"
        @refresh="refreshHistory"
        @next="nextPage"
        @previous="previousPage"
      >
      </wallet-history>

      <wallet-confirm-transaction-modal
        v-if="shouldShowConfirmation"
        :activeAddress="activeAddress"
        :transferInput="transferInput"
        :transactionFee="transactionFee"
        @cancel="shouldShowConfirmation = false"
        @confirm="confirmTransaction"
      >
      </wallet-confirm-transaction-modal>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountT, AccountsT, AddressT } from '@radixdlt/account'
import { Radix, TransferTokensOptions, StakePositions, TokenBalances, UnstakePositions, ManualUserConfirmTX, mockedAPI, TransactionTracking, TransactionHistory, TransactionStatus, SubmittedTransaction, TransactionHistoryOfKnownAddressRequestInput } from '@radixdlt/application'
import { Subscription, interval, Subject, Observable, combineLatest } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import WalletConfirmTransactionModal from './WalletConfirmTransactionModal.vue'
import WalletOverview from './WalletOverview.vue'
import WalletHistory from './WalletHistory.vue'
import WalletSidebarAccounts from './WalletSidebarAccounts.vue'
import WalletSidebarDefault from './WalletSidebarDefault.vue'
import WalletTransaction from './WalletTransaction.vue'
import { filter, mergeMap } from 'rxjs/operators'

const Wallet = defineComponent({
  components: {
    WalletConfirmTransactionModal,
    WalletOverview,
    WalletHistory,
    WalletSidebarAccounts,
    WalletSidebarDefault,
    WalletTransaction
  },

  setup () {
    const store = useStore()
    const router = useRouter()

    const activeAccount = ref(null)
    const activeAddress = ref(null)
    const activeStakes = ref(null)
    const activeUnstakes = ref(null)
    const accounts = ref(null)
    const tokenBalances = ref(0.01)
    const transactionHistory = ref(null)
    const shouldShowConfirmation = ref(false)
    const transferInput = ref({})
    const transactionFee = ref(0)
    const transactionToConfirm = ref(null)
    const pendingTransactions = ref([])
    const view = ref('overview')
    const draftTransaction = ref(null)
    const previousCursor = ref('')

    const userConfirmation = new Subject<ManualUserConfirmTX>()
    const userDidConfirm = new Subject<boolean>()
    const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const radix = Radix
      .create()
      .__withAPI(mockedAPI)
      .withWallet(store.state.wallet)
      .withTokenBalanceFetchTrigger(interval(3 * 60 * 1_000))
    const subs = new Subscription()

    radix.activeAccount.subscribe((accountRes: AccountT) => { activeAccount.value = accountRes }).add(subs)
    radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes }).add(subs)
    radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => { activeUnstakes.value = unstakes }).add(subs)
    radix.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }).add(subs)
    radix.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes }).add(subs)
    radix.activeAddress.subscribe((addressRes: AddressT) => { activeAddress.value = addressRes }).add(subs)

    const addAccount = () => radix.deriveNextAccount({ alsoSwitchTo: true })

    const switchAccount = (account: AccountT) => radix.switchAccount({ toAccount: account })

    const confirmTransaction = () => userDidConfirm.next(true)

    // Update transaction history whenever params change
    historyPagination
      .pipe(mergeMap((params: TransactionHistoryOfKnownAddressRequestInput) => radix.transactionHistory(params)))
      .subscribe((history: TransactionHistory) => {
        // Store cursor for navigation back to previous page before updating view
        if (transactionHistory.value && transactionHistory.value.cursor) previousCursor.value = transactionHistory.value.cursor
        else previousCursor.value = ''

        transactionHistory.value = history
      })
      .add(subs)

    const transferTokens = (data: TransferTokensOptions) => {
      let pollTXStatusTrigger: Observable<unknown>
      transferInput.value = data

      const buildTransferTokens = (): any => ({
        transferInput: data,
        userConfirmation: userConfirmation,
        pollTXStatusTrigger: pollTXStatusTrigger
      })

      const transactionTracking: TransactionTracking = radix.transferTokens({
        ...buildTransferTokens(),
        userConfirmation
      })

      // Subscribe to initial userConfirmation and display modal
      userConfirmation
        .subscribe((txnToConfirm: ManualUserConfirmTX) => {
          transactionToConfirm.value = txnToConfirm
          userDidConfirm.next(false)
          shouldShowConfirmation.value = true
          transactionFee.value = txnToConfirm.txToConfirm.fee
        })
        .add(subs)

      // Confirm transaction and move user to history view after they press confirm
      combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
        .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
          if (didConfirm) {
            txnToConfirm.confirm()
            shouldShowConfirmation.value = false
            view.value = 'history'
          }
        })
        .add(subs)

      // Store draft transaction actions
      transactionTracking.events
        .pipe(filter((trackingEvent) => trackingEvent.eventUpdateType === 'INITIATED'))
        .subscribe((res) => { draftTransaction.value = res.value }).add(subs)

      // Track pending transactions augmented with actions array
      transactionTracking.events
        .pipe(filter((trackingEvent) => trackingEvent.eventUpdateType === 'SUBMITTED'))
        .subscribe((res: any) => {
          pendingTransactions.value = pendingTransactions.value.concat([{
            ...res.value,
            actions: draftTransaction.value.actions
          }])
          draftTransaction.value = null
        })
        .add(subs)

      // Log transaction status to console for now
      transactionTracking.events
        .subscribe({
          next: (values: any) => {
            console.log('transaction tracking', values)
          },
          error: (e: any) => {
            console.warn('error', e)
          }
        })
        .add(subs)

      // Log transaction completed/error to console for now
      transactionTracking.completion
        .subscribe({
          next: (txnID: any) => {
            // To Do: Offer a way for the user to "refetch" history to include new items
            pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: SubmittedTransaction) => txnID.toString() !== pendingTxn.txID.toString())
          },
          error: (e: any) => {
            console.warn('error', e)
          }
        })
        .add(subs)
    }

    historyPagination.next({ size: 10 })

    const refreshHistory = () => {
      historyPagination.next({ size: 10 })
    }

    const nextPage = () => {
      historyPagination.next({
        size: 10,
        cursor: transactionHistory.value.cursor
      })
    }

    const previousPage = () => {
      historyPagination.next({
        size: 10,
        cursor: previousCursor.value
      })
    }

    return {
      accounts,
      activeAccount,
      activeAddress,
      activeStakes,
      activeUnstakes,
      confirmTransaction,
      tokenBalances,
      addAccount,
      transactionHistory,
      transactionFee,
      transferInput,
      switchAccount,
      transferTokens,
      shouldShowConfirmation,
      pendingTransactions,
      view,
      refreshHistory,
      nextPage,
      previousPage,
      previousCursor
    }
  },

  data () {
    return {
      sidebar: 'default'
    }
  },

  methods: {
    setView (view: string) {
      this.view = view
    }
  }
})

export default Wallet
</script>
