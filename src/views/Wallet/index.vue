<template>
  <div data-ci="wallet-view" class="flex flex-row h-screen">
    <wallet-sidebar-default
      v-if="sidebar == 'default'"
      :activeAccount="activeAccount"
      :activeView="view"
      @connectHW="connectHardwareWallet"
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
      <template v-if="view == 'overview'">
        <wallet-overview
          v-if="!loadingBalances"
          :activeAddress="activeAddress"
          :activeStakes="activeStakes"
          :activeUnstakes="activeUnstakes"
          :tokenBalances="tokenBalances"
          :nativeToken="nativeToken"
          :nativeTokenBalance="nativeTokenBalance"
          @requestFreeTokens="requestFreeTokens"
        >
        </wallet-overview>
         <wallet-loading
          v-else
        >
        </wallet-loading>
      </template>

      <template v-if="view == 'transaction'">
        <wallet-transaction
          v-if="!loadingBalances"
          :activeAddress="activeAddress"
          :tokenBalances="tokenBalances.tokenBalances"
          :shouldShowConfirmation="shouldShowConfirmation"
          :nativeToken="nativeToken"
          @transferTokens="transferTokens"
          ref="walletTransactionComponent"
        >
        </wallet-transaction>
        <wallet-loading
          v-else
        >
        </wallet-loading>
      </template>

      <template v-if="view == 'staking'">
        <wallet-staking
          v-if="!loadingBalances"
          :activeAddress="activeAddress"
          :activeStakes="activeStakes"
          :activeUnstakes="activeUnstakes"
          :tokenBalances="tokenBalances"
          :nativeToken="nativeToken"
          :nativeTokenBalance="nativeTokenBalance"
          @stakeTokens="stakeTokens"
          @unstakeTokens="unstakeTokens"
        >
        </wallet-staking>
        <wallet-loading
          v-else
        >
        </wallet-loading>

      </template>

      <template v-if="view == 'history'">
        <wallet-history
          v-if="!loadingHistory"
          :transactions="transactionHistory.transactions"
          :activeAddress="activeAddress"
          :pendingTransactions="pendingTransactions"
          :canGoBack="cursorStack.length > 0"
          :canGoNext="canGoNext"
          :nativeToken="nativeToken"
          @refresh="refreshHistory"
          @next="nextPage"
          @previous="previousPage"
        >
        </wallet-history>
        <wallet-loading
          v-else
        >
        </wallet-loading>
      </template>

      <wallet-confirm-transaction-modal
        v-if="shouldShowConfirmation"
        :activeAddress="activeAddress"
        :transferInput="transferInput"
        :stakeInput="stakeInput"
        :transactionFee="transactionFee"
        :selectedCurrency="selectedCurrency"
        :nativeToken="nativeToken"
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
        v-if="view == 'settings' && !loading"
      >
      </settings-index>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onUnmounted, Ref } from 'vue'
import { Subscription, interval, Subject, Observable, combineLatest, from, BehaviorSubject, ReplaySubject } from 'rxjs'
import {
  AccountAddressT,
  Radix,
  TransferTokensOptions,
  StakePositions,
  TokenBalances,
  UnstakePositions,
  ManualUserConfirmTX,
  TransactionTracking,
  StakeTokensInput,
  UnstakeTokensInput,
  TransactionStateUpdate,
  TransactionIdentifierT,
  TransactionHistoryOfKnownAddressRequestInput,
  TransactionHistory,
  Token,
  AmountT,
  AccountT,
  AccountsT,
  TransactionIntent,
  FinalizedTransaction,
  IntendedAction,
  TransactionStateSuccess,
  StakeOptions,
  UnstakeOptions,
  TransferTokensInput,
  TokenBalance,
  LogLevel
} from '@radixdlt/application'
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
import { deriveHWAccount } from '@/actions/vue/create-wallet'

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[];
}

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
    const activeAddress: Ref<AccountAddressT | null> = ref(null)
    const activeStakes: Ref<StakePositions | null> = ref(null)
    const activeUnstakes: Ref<UnstakePositions | null> = ref(null)
    const accounts: Ref<AccountsT | null> = ref(null)
    const tokenBalances: Ref<TokenBalances | null> = ref(null)
    const transactionHistory: Ref<TransactionHistory> = ref({ transactions: [] })
    const shouldShowConfirmation: Ref<boolean> = ref(false)
    const transferInput: Ref<TransferTokensInput> = ref({})
    const stakeInput: Ref<StakeTokensInput> = ref({})
    const transactionFee: Ref<AmountT> = ref(0)
    const transactionToConfirm: Ref<ManualUserConfirmTX | null> = ref(null)
    const pendingTransactions: Ref<Array<PendingTransaction>> = ref([])
    const view: Ref<string> = ref('overview')
    const sidebar = ref('default')
    const draftTransaction: Ref<TransactionIntent | null> = ref(null)
    const cursorStack = ref([])
    const canGoNext: Ref<boolean> = ref(false)
    const nativeToken: Ref<Token | null> = ref(null)
    const selectedCurrency: Ref<TokenBalance | null> = ref(null)
    const nativeTokenBalance: Ref<TokenBalance | null> = ref(null)

    const loadingBalances: Ref<boolean> = ref(true)
    const loadingHistory: Ref<boolean> = ref(true)

    const walletTransactionComponent = ref(null)

    const userDidConfirm = new Subject<boolean>()
    const userDidCancel = new Subject<boolean>()
    const userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
    const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()
    const faucetParams = new Subject<number>()

    // Set initial view if provided in props
    onBeforeMount(() => {
      if (props.initialView) view.value = props.initialView
      if (props.initialSidebar) sidebar.value = props.initialSidebar
    })

    const startLoading = () => {
      loadingBalances.value = true
      loadingHistory.value = true
    }

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const radix = Radix
      .create()
      .connect('https://betanet.radixdlt.com/rpc')
      .withWallet(store.state.wallet)
      .withTokenBalanceFetchTrigger(interval(5 * 1_000))
      .withStakingFetchTrigger(interval(5 * 1_000))
      .logLevel(LogLevel.INFO)

    const subs = new Subscription()

    subs.add(radix.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => {
      loadingBalances.value = false
      tokenBalances.value = tokenBalancesRes
    }))
    subs.add(radix.activeAccount.subscribe((account: AccountT) => { activeAccount.value = account }))
    subs.add(radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes }))
    subs.add(radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => { activeUnstakes.value = unstakes }))
    subs.add(radix.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }))
    subs.add(radix.activeAddress.subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))
    subs.add(radix.ledger.nativeToken().subscribe((nativeTokenRes: Token) => { nativeToken.value = nativeTokenRes }))

    const fetchNativeTokenBalanceTrigger = combineLatest<[TokenBalances, Token]>([
      radix.tokenBalances,
      radix.ledger.nativeToken()
    ])
    subs.add(fetchNativeTokenBalanceTrigger
      .subscribe(([tokenBalancesRes, nativeTokenRes]: [TokenBalances, Token]) => {
        if (nativeTokenRes && tokenBalancesRes.tokenBalances && tokenBalancesRes.tokenBalances.length > 0) {
          nativeTokenBalance.value = tokenBalancesRes.tokenBalances.find((tb: TokenBalance) => tb.token.rri.equals(nativeTokenRes.rri)) || null
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

    const addAccount = () => {
      getDerivedAccountsIndex()
        .then((index: string) => {
          saveDerivedAccountsIndex(Number(index) + 1)
          tokenBalances.value = null
          startLoading()
          radix.deriveNextAccount({ alsoSwitchTo: true })
        })
    }

    const switchAccount = (account: AccountT) => {
      tokenBalances.value = null
      startLoading()
      radix.switchAccount({ toAccount: account })
    }

    const confirmTransaction = () => userDidConfirm.next(true)

    const cancelTransaction = () => userDidCancel.next(true)

    // Fetch history when user navigates to next page and every 5 seconds
    const fetchTXHistoryTrigger = combineLatest<[TransactionHistoryOfKnownAddressRequestInput, number]>([
      historyPagination.asObservable(),
      interval(5 * 1_000)
    ])
    subs.add(fetchTXHistoryTrigger
      .pipe(mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) => {
        return radix.transactionHistory(params)
      }))
      .subscribe((history: TransactionHistory) => {
        loadingHistory.value = false
        if (history.cursor) canGoNext.value = true
        else canGoNext.value = false
        transactionHistory.value = history
      }))

    // This isn't firing the way I want it to
    subs.add(faucetParams
      .pipe(mergeMap(() => radix.tokenBalances))
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
        .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'INITIATED'))
        .subscribe((res: TransactionStateUpdate) => {
          const transactionIntent = res as unknown as TransactionIntent
          draftTransaction.value = transactionIntent
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
          shouldShowConfirmation.value = false
          view.value = 'history'
        })
      subs.add(trackingSubmittedEvents)

      // Log transaction completed/error to console for now
      subs.add(transactionTracking.completion
        .subscribe({
          next: (txnID: TransactionIdentifierT) => {
            pendingTransactions.value = pendingTransactions.value.filter((pendingTxn: TransactionStateSuccess) => {
              const transactionState = pendingTxn.transactionState as unknown as FinalizedTransaction
              return txnID.toString() !== transactionState.txID.toString()
            })
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
    const transferTokens = (transferTokensInput: TransferTokensInput, sc: TokenBalance) => {
      let pollTXStatusTrigger: Observable<unknown>
      transferInput.value = transferTokensInput
      selectedCurrency.value = sc

      const buildTransferTokens = (): TransferTokensOptions => ({
        transferInput: transferTokensInput,
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
    const stakeTokens = (stakeTokensInput: StakeTokensInput) => {
      let pollTXStatusTrigger: Observable<unknown>
      stakeInput.value = stakeTokensInput
      selectedCurrency.value = nativeTokenBalance.value

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
      stakeInput.value = unstakeTokensInput
      selectedCurrency.value = nativeTokenBalance.value

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
          address: activeAddress.value ? activeAddress.value.toString() : ''
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

    const connectHardwareWallet = () => {
      console.log('fetching hw account...')
      deriveHWAccount().then((something: any) => {
        console.log(something)
      })
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
      nativeTokenBalance,
      selectedCurrency,
      loadingBalances,
      loadingHistory,

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
      connectHardwareWallet,

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
