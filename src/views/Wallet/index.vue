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

    <template v-if="loaded">
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
          v-show="!loadingBalances"
          :activeAddress="activeAddress"
          :tokenBalances="tokenBalances.tokenBalances"
          :nativeToken="nativeToken"
          @transferTokens="transferTokens"
          ref="walletTransactionComponent"
        >
        </wallet-transaction>
        <wallet-loading
          v-if="loadingBalances"
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
          ref="walletStakingComponent"
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
          :messages="transactionMessages"
          :activeAddress="activeAddress"
          :pendingTransactions="pendingTransactions"
          :canGoBack="cursorStack.length > 0"
          :canGoNext="canGoNext"
          :loadingHistoryPage="loadingHistoryPage"
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
        :transactionState="transactionState"
        :activeMessage="activeMessageInTransaction"
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
import { Subscription, interval, Subject, Observable, combineLatest, from, BehaviorSubject, ReplaySubject, of, firstValueFrom } from 'rxjs'
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
  TransactionStateError,
  MessageInTransaction,
  ExecutedTransaction,
  Message
  LogLevel,
  HDPathRadixT,
  Signature,
  PublicKey,
  ECPointOnCurve
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
import { filter, mergeMap, map } from 'rxjs/operators'
import { getDerivedAccountsIndex, saveDerivedAccountsIndex } from '@/actions/vue/data-store'
import { useI18n } from 'vue-i18n'
import { sendAPDU } from '@/actions/vue/create-wallet'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'

const PAGE_SIZE = 50

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
    const transactionMessages: Ref<{id: string, message: string | null}[]> = ref([])
    const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
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
    const activeMessage: Ref<string> = ref('')

    const loadingBalances: Ref<boolean> = ref(true)
    const loadingHistory: Ref<boolean> = ref(true)
    const loadingHistoryPage: Ref<boolean> = ref(true)

    // can be building, confirm, submitting
    const transactionState: Ref<string> = ref('confirm')

    const walletTransactionComponent = ref(null)
    const walletStakingComponent = ref(null)

    const userDidConfirm = new Subject<boolean>()
    const userDidCancel = new Subject<boolean>()
    let userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
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
      loadingHistoryPage.value = true
    }

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const radix = Radix
      .create()
      .connect(process.env.VUE_APP_API || '')
      .withWallet(store.state.wallet)
      .withTokenBalanceFetchTrigger(interval(5 * 1_000))
      .withStakingFetchTrigger(interval(5 * 1_000))

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
        } else {
          nativeTokenBalance.value = null
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

    const isHexEncoded = (value: string): boolean => {
      const buffer = Buffer.from(value, 'hex')
      const encryptedMessageResult = Message.fromBuffer(buffer)
      return !encryptedMessageResult.isOk()
    }

    const parseMessage = (tx: ExecutedTransaction): Promise<{id: string, message: string | null}> => {
      return new Promise((resolve) => {
        const id = tx.txID.toString()
        if (!tx.message) {
          return resolve({ id, message: null })
        }
        if (isHexEncoded(tx.message)) {
          return resolve({ id, message: Buffer.from(tx.message, 'hex').toString('utf8') })
        }
        firstValueFrom(radix.decryptTransaction(tx)).then((val) => {
          return resolve({ id, message: val })
        })
      })
    }

    subs.add(fetchTXHistoryTrigger
      .pipe(
        mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) => {
          return radix.transactionHistory(params)
        }),
        map((history: TransactionHistory) => {
          const allMessages = history.transactions.map((tx: ExecutedTransaction) => parseMessage(tx))
          Promise.all(allMessages).then((data) => { transactionMessages.value = data })
          return history
        })
      )
      .subscribe((history: TransactionHistory) => {
        loadingHistory.value = false
        loadingHistoryPage.value = false
        if (history.cursor && history.transactions.length === PAGE_SIZE) canGoNext.value = true
        else canGoNext.value = false
        // console.log('history', history)
        transactionHistory.value = history
      }))

    // This isn't firing the way I want it to
    subs.add(faucetParams
      .pipe(mergeMap(() => radix.tokenBalances))
      .subscribe((tokenBalancesRes: TokenBalances) => { tokenBalances.value = tokenBalancesRes }))

    const confirmAndExecuteTransaction = (transactionTracking: TransactionTracking) => {
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
        .pipe(filter((trackingEvent: any) => trackingEvent.error != null)) // This is really returning TransactionStateError
        .subscribe((res: TransactionStateError) => {
          userDidCancel.next(true)
          shouldShowConfirmation.value = false
          if (view.value === 'transaction') {
            walletTransactionComponent.value.setErrors({
              amount: t('validations.transactionFailed')
            })
          } else if (walletStakingComponent.value.$data.activeForm === 'stake') {
            walletStakingComponent.value.setErrors({
              amount: t('validations.stakeFailed')
            })
          } else {
            walletStakingComponent.value.setErrors({
              amount: t('validations.unstakeFailed')
            })
          }
        })
      subs.add(trackingSubmittedEventErrors)

      // Store draft transaction actions
      subs.add(transactionTracking.events
        .pipe(filter((trackingEvent: TransactionStateUpdate) => trackingEvent.eventUpdateType === 'INITIATED'))
        .subscribe((res: TransactionStateUpdate) => {
          const transactionIntent = res as unknown as TransactionIntent
          console.log('transactionintent', transactionIntent)
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
          transactionState.value = 'submitting'
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
            shouldShowConfirmation.value = false
            view.value = 'history'
            transactionDidComplete.next(true)
          },
          error: () => {
            userDidCancel.next(true)
            shouldShowConfirmation.value = false
            if (view.value === 'transaction') {
              walletTransactionComponent.value.setErrors({
                amount: t('validations.transactionFailed')
              })
            } else if (walletStakingComponent.value.$data.activeForm === 'stake') {
              walletStakingComponent.value.setErrors({
                amount: t('validations.stakeFailed')
              })
            } else {
              walletStakingComponent.value.setErrors({
                amount: t('validations.unstakeFailed')
              })
            }
          }
        }))

      // Cleanup subscriptions on cancel and complete
      const cleanupTransactionSubs = () => {
        userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
        createUserConfirmation.unsubscribe()
        watchUserDidConfirm.unsubscribe()
        trackingSubmittedEvents.unsubscribe()
      }
      userDidCancel.subscribe((didCancel: boolean) => {
        if (didCancel) {
          cleanupTransactionSubs()
          shouldShowConfirmation.value = false
          activeMessage.value = ''
        }
      })

      subs.add(transactionDidComplete.subscribe((didComplete: boolean) => {
        if (didComplete) {
          cleanupTransactionSubs()
          activeMessage.value = ''
          historyPagination.next({ size: PAGE_SIZE })
        }
      }))
    }

    // call transferTokens() with built options and subscribe to confirmation and results
    const transferTokens = (transferTokensInput: TransferTokensInput, message: MessageInTransaction, sc: TokenBalance) => {
      let pollTXStatusTrigger: Observable<unknown>
      transferInput.value = transferTokensInput
      selectedCurrency.value = sc
      activeMessage.value = message.plaintext
      activeMessageInTransaction.value = message
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

    historyPagination.next({ size: PAGE_SIZE })

    const refreshHistory = () => {
      historyPagination.next({ size: PAGE_SIZE })
    }

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

    const requestFreeTokens = () => {
      const request = {
        params: {
          address: activeAddress.value ? activeAddress.value.toString() : ''
        }
      }
      subs.add(from(
        fetch('https://sandpitnet-faucet.radixdlt.com/faucet/request', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      ).subscribe(() => { faucetParams.next(Math.random()) }))
    }

    const connectHardwareWallet = () => {
      console.log('fetching hw account...')
      radix.deriveHWAccount({
        keyDerivation: 'next',
        hardwareWalletConnection: HardwareWalletLedger.create({
          send: sendAPDU,
          close: () => Promise.resolve()
        })
      }).subscribe((hwAccount: any) => {
        console.log('got hw account: ', hwAccount.address.toString())
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
      transactionMessages,
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
      transactionState,
      activeMessage,
      activeMessageInTransaction,
      radix,

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
      walletTransactionComponent,
      walletStakingComponent
    }
  },

  methods: {
    setView (view: string) {
      this.view = view
    }
  },
  computed: {
    loaded () : boolean {
      return this.activeAddress != null && this.activeStakes != null && this.activeUnstakes != null && this.tokenBalances != null && this.nativeToken != null
    }
  }
})

export default WalletIndex
</script>
