<template>
  <div data-ci="wallet-view" class="flex flex-row h-screen">
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
      @addAccount="() => { addAccount() ; view = 'editName' }"
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
        @requestFreeTokens="requestFreeTokens"
      >
      </wallet-overview>

      <wallet-transaction
        v-if="view == 'transaction'"
        :activeAddress="activeAddress"
        :tokenBalances="tokenBalances.tokenBalances"
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

      <settings-index
        v-if="view == 'settings'"
      >
      </settings-index>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onUnmounted } from 'vue'
import { AccountT, AccountsT, AddressT } from '@radixdlt/account'
import { Subscription, interval, Subject, Observable, combineLatest, from } from 'rxjs'
import { Radix, TransferTokensOptions, StakePositions, TokenBalances, UnstakePositions, ManualUserConfirmTX, mockedAPI, TransactionTracking, StakeTokensInput, UnstakeTokensInput, TransactionStateUpdate, TransactionIdentifierT, TransactionHistoryOfKnownAddressRequestInput, TransactionHistory } from '@radixdlt/application'
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
import SettingsIndex from '@/views/Settings/index.vue'
import { filter, mergeMap } from 'rxjs/operators'

const WalletIndex = defineComponent({
  components: {
    AccountEditName,
    SettingsIndex,
    WalletConfirmTransactionModal,
    WalletOverview,
    WalletHistory,
    WalletSidebarAccounts,
    WalletSidebarDefault,
    WalletStaking,
    WalletTransaction
  },

  props: {
    initialView: String,
    initialSidebar: String
  },

  setup (props) {
    const store = useStore()
    const router = useRouter()

    const activeAccount = ref(null)
    const activeAddress = ref(null)
    const activeStakes = ref(null)
    const activeUnstakes = ref(null)
    const accounts = ref(null)
    const tokenBalances = ref({ tokenBalances: [] })
    const transactionHistory = ref({ transactions: [] })
    const shouldShowConfirmation = ref(false)
    const transferInput = ref({})
    const stakeInput = ref({})
    const transactionFee = ref(0)
    const transactionToConfirm = ref(null)
    const pendingTransactions = ref([])
    const view = ref('overview')
    const sidebar = ref('default')
    const draftTransaction = ref(null)
    const previousCursor = ref('')

    const userDidConfirm = new Subject<boolean>()
    const userConfirmation = new Subject<ManualUserConfirmTX>()
    const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()
    const faucetParams = new Subject<number>()

    // Set initial view if provided in props
    onBeforeMount(() => {
      if (props.initialView) view.value = props.initialView
      if (props.initialSidebar) sidebar.value = props.initialSidebar
    })

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const radix = Radix
      .create()
      .__withAPI(mockedAPI)
      .withWallet(store.state.wallet)
      .withTokenBalanceFetchTrigger(interval(5 * 1_000))

    const wallet = Radix
      .create()
      .connect('https://54.73.253.49/rpc')
      .withWallet(store.state.wallet) // wallet subscriptions don't work when we use the local wallet
      .withTokenBalanceFetchTrigger(interval(5 * 1_000))

    const subs = new Subscription()

    wallet.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes }).add(subs)
    wallet.activeAccount.subscribe((accountRes: AccountT) => { activeAccount.value = accountRes }).add(subs)
    radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes }).add(subs)
    radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => { activeUnstakes.value = unstakes }).add(subs)
    wallet.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }).add(subs)
    wallet.activeAddress.subscribe((addressRes: AddressT) => { activeAddress.value = addressRes }).add(subs)

    // wallet.errors.subscribe(
    //   (errorNotification) => {
    //     console.warn(errorNotification)
    //     console.log(`☣️ error ${errorNotification}`)
    //   }
    // ).add(subs)

    const addAccount = () => wallet.deriveNextAccount({ alsoSwitchTo: true })

    const switchAccount = (account: AccountT) => wallet.switchAccount({ toAccount: account })

    const confirmTransaction = () => userDidConfirm.next(true)

    // Update transaction history whenever params change
    historyPagination
      .pipe(mergeMap((params: TransactionHistoryOfKnownAddressRequestInput) => wallet.transactionHistory(params)))
      .subscribe((history: TransactionHistory) => {
        // Store cursor for navigation back to previous page before updating view
        if (transactionHistory.value && transactionHistory.value.cursor) previousCursor.value = transactionHistory.value.cursor
        else previousCursor.value = ''

        transactionHistory.value = history
      })
      .add(subs)

    // This isn't firing the way I want it to
    faucetParams
      .pipe(mergeMap((params: number) => wallet.tokenBalances))
      .subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes })
      .add(subs)

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
        .subscribe((res) => { draftTransaction.value = res })
      trackingInitiated.add(subs)

      // Track pending transactions augmented with actions array
      const trackingSubmittedEvents = transactionTracking.events
        .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'SUBMITTED'))
        .subscribe((res: TransactionStateUpdate) => {
          pendingTransactions.value = pendingTransactions.value.concat([{
            ...res,
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
          next: (txnID: TransactionIdentifierT) => {
            console.log('completed', txnID, pendingTransactions.value)
            // To Do: Offer a way for the user to "refetch" history to include new items
            pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: any) => txnID.toString() !== pendingTxn.txID.toString())
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

      const transactionTracking: TransactionTracking = wallet.transferTokens({
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

    historyPagination.next({ size: 10 })

    const refreshHistory = () => {
      historyPagination.next({ size: 10 })
    }

    const nextPage = () => {
      console.log('requesting next', {
        size: 10,
        cursor: transactionHistory.value.cursor
      })
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

    const requestFreeTokens = () => {
      const request = {
        params: {
          address: activeAddress.value.toString()
        }
      }
      from(
        fetch('https://54.73.253.49/faucet/request', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      ).subscribe(() => { faucetParams.next(Math.random()) }).add(subs)
    }

    onUnmounted(() => subs.unsubscribe())

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
      view,
      sidebar,
      refreshHistory,
      nextPage,
      previousPage,
      previousCursor,
      requestFreeTokens
    }
  },

  methods: {
    setView (view: string) {
      this.view = view
    }
  }
})

export default WalletIndex
</script>
