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
      <wallet-loading
        v-if="loading"
      >
      </wallet-loading>

      <wallet-overview
        v-if="view == 'overview' && !loading"
        :activeAddress="activeAddress"
        :activeStakes="activeStakes"
        :activeUnstakes="activeUnstakes"
        :tokenBalances="tokenBalances"
        :nativeToken="nativeToken"
        @requestFreeTokens="requestFreeTokens"
      >
      </wallet-overview>

      <wallet-transaction
        v-if="view == 'transaction'"
        :activeAddress="activeAddress"
        :tokenBalances="tokenBalances.tokenBalances"
        :shouldShowConfirmation="shouldShowConfirmation"
        :nativeToken="nativeToken"
        @transferTokens="transferTokens"
        ref="walletTransactionComponent"
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
        :canGoBack="cursorStack.length > 0"
        :canGoNext="canGoNext"
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
        :selectedCurrency="selectedCurrency"
        @cancel="cancelTransaction"
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
import { defineComponent, onBeforeMount, onUnmounted, Ref } from 'vue'
import { AccountT, AccountsT, AccountAddressT } from '@radixdlt/account'
import { Subscription, interval, Subject, Observable, combineLatest, from, BehaviorSubject } from 'rxjs'
import { Radix, TransferTokensOptions, StakePositions, TokenBalances, UnstakePositions, ManualUserConfirmTX, mockedAPI, TransactionTracking, StakeTokensInput, UnstakeTokensInput, TransactionStateUpdate, TransactionIdentifierT, TransactionHistoryOfKnownAddressRequestInput, TransactionHistory, Token } from '@radixdlt/application'
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
import WalletLoading from './WalletLoading.vue'
import AccountEditName from '@/views/Account/AccountEditName.vue'
import SettingsIndex from '@/views/Settings/index.vue'
import { filter, mergeMap } from 'rxjs/operators'
import { getDerivedAccountsIndex, saveDerivedAccountsIndex } from '@/actions/vue/data-store'
import { useI18n } from 'vue-i18n'

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
    WalletTransaction,
    WalletLoading
  },

  props: {
    initialView: String,
    initialSidebar: String
  },

  setup (props) {
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n({ useScope: 'global' })

    const activeAccount: Ref<AccountT | null> = ref(null)
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
    const cursorStack = ref([])
    const canGoNext = ref(false)
    const nativeToken = ref(null)
    const selectedCurrency: Ref<Token | null> = ref(null)
    const loading = ref(true)

    const walletTransactionComponent = ref(null)

    const userDidConfirm = new Subject<boolean>()
    const userDidCancel = new Subject<boolean>()
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
      .connect('https://betanet.radixdlt.com/rpc')
      .withWallet(store.state.wallet)
      .withTokenBalanceFetchTrigger(interval(5 * 1_000))

    const subs = new Subscription()

    subs.add(wallet.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => {
      loading.value = false
      tokenBalances.value = tokenBalancesRes
    }))
    subs.add(wallet.activeAccount.subscribe((accountRes: AccountT) => { activeAccount.value = accountRes }))
    subs.add(radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes }))
    subs.add(radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => { activeUnstakes.value = unstakes }))
    subs.add(wallet.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }))
    subs.add(wallet.activeAddress.subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))
    subs.add(wallet.ledger.nativeToken().subscribe((nativeTokenRes: Token) => { nativeToken.value = nativeTokenRes }))

    getDerivedAccountsIndex()
      .then((accountsIndex: string) => {
        if ((Number(accountsIndex)) > 0) {
          wallet.restoreAccountsUpToIndex(Number(accountsIndex) + 1)
            .subscribe(
              (accountRes: AccountsT) => { accounts.value = accountRes })
        } else {
          saveDerivedAccountsIndex(0)
        }
      })

    const startLoading = () => {
      loading.value = true
      setTimeout(() => { loading.value = false }, 5000)
    }

    const addAccount = () => {
      getDerivedAccountsIndex()
        .then((index: string) => {
          saveDerivedAccountsIndex(Number(index) + 1)
          tokenBalances.value = []
          startLoading()
          wallet.deriveNextAccount({ alsoSwitchTo: true })
        })
    }

    const switchAccount = (account: AccountT) => {
      tokenBalances.value = []
      startLoading()
      wallet.switchAccount({ toAccount: account })
    }

    const confirmTransaction = () => userDidConfirm.next(true)

    const cancelTransaction = () => userDidCancel.next(true)

    // Fetch history when user navigates to next page and every 5 seconds
    const fetchTXHistoryTrigger = combineLatest<[TransactionHistoryOfKnownAddressRequestInput, number]>([
      historyPagination.asObservable(),
      interval(5 * 1_000)
    ])
    subs.add(fetchTXHistoryTrigger
      .pipe(mergeMap(([params, i]: [TransactionHistoryOfKnownAddressRequestInput, number]) => {
        return wallet.transactionHistory(params)
      }))
      .subscribe((history: TransactionHistory) => {
        if (history.cursor) canGoNext.value = true
        else canGoNext.value = false
        transactionHistory.value = history
      }))

    // This isn't firing the way I want it to
    subs.add(faucetParams
      .pipe(mergeMap((params: number) => wallet.tokenBalances))
      .subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes }))

    const confirmAndExecuteTransaction = (transactionTracking: TransactionTracking) => {
      const transactionDidComplete = new BehaviorSubject<boolean>(false)
      userDidCancel.next(false)

      // Subscribe to initial userConfirmation and display modal
      const createUserConfirmation = userConfirmation
        .subscribe((txnToConfirm: ManualUserConfirmTX) => {
          transactionToConfirm.value = txnToConfirm
          userDidConfirm.next(false)
          shouldShowConfirmation.value = true
          transactionFee.value = txnToConfirm.txToConfirm.fee
        })
      subs.add(createUserConfirmation)

      // Confirm transaction and move user to history view after they press confirm
      const watchUserDidConfirm = combineLatest<[ManualUserConfirmTX, boolean]>([userConfirmation, userDidConfirm])
        .subscribe(([txnToConfirm, didConfirm]: [ManualUserConfirmTX, boolean]) => {
          if (didConfirm) { txnToConfirm.confirm() }
        })
      subs.add(watchUserDidConfirm)

      // Store draft transaction actions
      subs.add(transactionTracking.events
        .pipe(filter((trackingEvent) => trackingEvent.eventUpdateType === 'INITIATED'))
        .subscribe((res) => { draftTransaction.value = res }))

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
      subs.add(trackingSubmittedEvents)

      // Log transaction completed/error to console for now
      subs.add(transactionTracking.completion
        .subscribe({
          next: (txnID: TransactionIdentifierT) => {
            pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: any) => txnID.toString() !== pendingTxn.transactionState.txID.toString())
            transactionDidComplete.next(true)
          },
          error: () => {
            userDidCancel.next(true)
            walletTransactionComponent.value.setErrors({
              amount: t('validations.transactionFailed')
            })
          }
        }))

      // Cleanup subscriptions on cancel and complete
      const cleanupTransactionSubs = () => {
        createUserConfirmation.unsubscribe()
        watchUserDidConfirm.unsubscribe()
        trackingSubmittedEvents.unsubscribe()
      }
      userDidCancel.subscribe((didCancel: boolean) => {
        if (didCancel) {
          cleanupTransactionSubs()
          shouldShowConfirmation.value = false
        }
      })

      subs.add(transactionDidComplete.subscribe((didComplete: boolean) => {
        if (didComplete) {
          cleanupTransactionSubs()
          historyPagination.next({ size: 100 })
        }
      }))
    }

    // call transferTokens() with built options and subscribe to confirmation and results
    const transferTokens = (data: TransferTokensOptions, sc: Token) => {
      let pollTXStatusTrigger: Observable<unknown>
      transferInput.value = data
      selectedCurrency.value = sc

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

    historyPagination.next({ size: 100 })

    const refreshHistory = () => {
      historyPagination.next({ size: 100 })
    }

    const nextPage = () => {
      cursorStack.value.push(transactionHistory.value.cursor)
      historyPagination.next({
        size: 100,
        cursor: cursorStack.value[cursorStack.value.length - 1]
      })
    }

    const previousPage = () => {
      cursorStack.value.pop()
      historyPagination.next({
        size: 100,
        cursor: cursorStack.value.length > 0 ? cursorStack.value[cursorStack.value.length - 1] : ''
      })
    }

    const requestFreeTokens = () => {
      const request = {
        params: {
          address: activeAddress.value.toString()
        }
      }
      subs.add(from(
        fetch('https://betanet-faucet.radixdlt.com/faucet/request', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      ).subscribe(() => { faucetParams.next(Math.random()) }))
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      // data
      accounts,
      activeAccount,
      activeAddress,
      activeStakes,
      activeUnstakes,
      tokenBalances,
      transactionHistory,
      transactionFee,
      transferInput,
      stakeInput,
      pendingTransactions,
      cursorStack,
      nativeToken,
      selectedCurrency,
      loading,

      // view flags
      view,
      sidebar,

      // boolean flags
      canGoNext,
      shouldShowConfirmation,

      // methods
      switchAccount,
      confirmTransaction,
      cancelTransaction,
      addAccount,
      transferTokens,
      stakeTokens,
      unstakeTokens,
      refreshHistory,
      nextPage,
      previousPage,
      requestFreeTokens,

      // child component refs
      walletTransactionComponent
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
