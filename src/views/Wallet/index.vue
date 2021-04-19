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
      @editName="setView('editName')"
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

      <wallet-staking
        v-if="view == 'staking'"
        :activeAddress="activeAddress"
        :activeStakes="activeStakes"
        :activeUnstakes="activeUnstakes"
        :tokenBalances="tokenBalances"
        @stakeTokens="stakeTokens"
        @unstakeTokens="unstakeTokens"
      >
      </wallet-staking>

      <wallet-history
        v-if="view == 'history'"
        :transactions="transactionHistory.transactions"
        :activeAddress="activeAddress"
        :pendingTransactions="pendingTransactions"
      >
      </wallet-history>

      <wallet-confirm-transaction-modal
        v-if="shouldShowConfirmation"
        :activeAddress="activeAddress"
        :transferInput="transferInput"
        :stakeInput="stakeInput"
        :transactionFee="transactionFee"
        @cancel="shouldShowConfirmation = false"
        @confirm="confirmTransaction"
      >
      </wallet-confirm-transaction-modal>

      <account-edit-name
        v-if="view == 'editName'"
        :activeAddress="activeAddress"
        @save="view = 'overview'; sidebar = 'default'"
      >
      </account-edit-name>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountT, AccountsT, AddressT } from '@radixdlt/account'
import { Subscription, interval, Subject, Observable, combineLatest } from 'rxjs'
import { Radix, TransferTokensOptions, StakePositions, TokenBalances, UnstakePositions, ManualUserConfirmTX, mockedAPI, TransactionTracking, SubmittedTransaction, StakeTokensInput, UnstakeTokensInput } from '@radixdlt/application'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import WalletConfirmTransactionModal from './WalletConfirmTransactionModal.vue'
import WalletOverview from './WalletOverview.vue'
import WalletHistory from './WalletHistory.vue'
import WalletSidebarAccounts from './WalletSidebarAccounts.vue'
import WalletSidebarDefault from './WalletSidebarDefault.vue'
import WalletStaking from './WalletStaking.vue'
import WalletTransaction from './WalletTransaction.vue'
import AccountEditName from '@/views/Account/AccountEditName.vue'
import { filter } from 'rxjs/operators'

const Wallet = defineComponent({
  components: {
    AccountEditName,
    WalletConfirmTransactionModal,
    WalletOverview,
    WalletHistory,
    WalletSidebarAccounts,
    WalletSidebarDefault,
    WalletStaking,
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
    const stakeInput = ref({})
    const transactionFee = ref(0)
    const transactionToConfirm = ref(null)
    const pendingTransactions = ref([])
    const view = ref('overview')
    const draftTransaction = ref(null)

    const userDidConfirm = new Subject<boolean>()
    const userConfirmation = new Subject<ManualUserConfirmTX>()

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
    radix.transactionHistory({ size: 10 }).subscribe((txs) => { transactionHistory.value = txs }).add(subs)
    radix.activeAddress.subscribe((addressRes: AddressT) => { activeAddress.value = addressRes }).add(subs)

    const addAccount = () => radix.deriveNextAccount({ alsoSwitchTo: true })

    const switchAccount = (account: AccountT) => radix.switchAccount({ toAccount: account })

    const confirmTransaction = () => userDidConfirm.next(true)

    const confirmAndExecuteTransaction = (transactionTracking: TransactionTracking) => {
      const transactionDidComplete = new Subject<boolean>()
      transactionDidComplete.next(false)

      // Subscribe to initial userConfirmation and display modal
      const createUserConfirmation = userConfirmation
        .subscribe((txnToConfirm: ManualUserConfirmTX) => {
          transactionToConfirm.value = txnToConfirm
          userDidConfirm.next(false)
          shouldShowConfirmation.value = true
          transactionFee.value = txnToConfirm.txToConfirm.fee
        })
      createUserConfirmation.add(subs)

      // Confirm transaction and move user to history view after they press confirm
      const watchUserDidConfirm = combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
        .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
          if (didConfirm) { txnToConfirm.confirm() }
        })
      watchUserDidConfirm.add(subs)

      // Store draft transaction actions
      const trackingInitiated = transactionTracking.events
        .pipe(filter((trackingEvent) => trackingEvent.eventUpdateType === 'INITIATED'))
        .subscribe((res) => { draftTransaction.value = res.value })
      trackingInitiated.add(subs)

      // Track pending transactions augmented with actions array
      const trackingSubmittedEvents = transactionTracking.events
        .pipe(filter((trackingEvent) => trackingEvent.eventUpdateType === 'SUBMITTED'))
        .subscribe((res: any) => {
          pendingTransactions.value = pendingTransactions.value.concat([{
            ...res.value,
            actions: draftTransaction.value.actions
          }])
          draftTransaction.value = null
          shouldShowConfirmation.value = false
          view.value = 'history'
        })
      trackingSubmittedEvents.add(subs)

      // Log transaction status to console for now
      const trackingAllEvents = transactionTracking.events
        .subscribe({
          next: (values: any) => {
            console.log('transaction tracking', values)
          },
          error: (e: any) => {
            console.warn('error', e)
          }
        })
      trackingAllEvents.add(subs)

      // Log transaction completed/error to console for now
      const trackingCompletion = transactionTracking.completion
        .subscribe({
          next: (txnID: any) => {
            // To Do: Offer a way for the user to "refetch" history to include new items
            pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: SubmittedTransaction) => txnID.toString() !== pendingTxn.txID.toString())
            transactionDidComplete.next(true)
          },
          error: (e: any) => {
            console.warn('error', e)
          }
        })
      trackingCompletion.add(subs)

      // Cleanup subscriptions
      transactionDidComplete.subscribe((didComplete: boolean) => {
        if (didComplete) {
          createUserConfirmation.unsubscribe()
          watchUserDidConfirm.unsubscribe()
          trackingInitiated.unsubscribe()
          trackingSubmittedEvents.unsubscribe()
          trackingAllEvents.unsubscribe()
          trackingCompletion.unsubscribe()
        }
      }).add(subs)
    }

    // call transferTokens() with built options and subscribe to confirmation and results
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

      confirmAndExecuteTransaction(transactionTracking)
    }

    // call stakeTokens() with built options and subscribe to confirmation and results
    const stakeTokens = (data: StakeTokensInput) => {
      let pollTXStatusTrigger: Observable<unknown>
      stakeInput.value = data

      const buildTransferTokens = (): any => ({
        stakeInput: data,
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
    const unstakeTokens = (data: UnstakeTokensInput) => {
      let pollTXStatusTrigger: Observable<unknown>
      stakeInput.value = data

      const buildTransferTokens = (): any => ({
        unstakeInput: data,
        userConfirmation: userConfirmation,
        pollTXStatusTrigger: pollTXStatusTrigger
      })

      const unstakingTransactionTracking: TransactionTracking = radix.unstakeTokens({
        ...buildTransferTokens(),
        userConfirmation
      })

      confirmAndExecuteTransaction(unstakingTransactionTracking)
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
      stakeInput,
      switchAccount,
      transferTokens,
      stakeTokens,
      unstakeTokens,
      shouldShowConfirmation,
      pendingTransactions,
      view
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
