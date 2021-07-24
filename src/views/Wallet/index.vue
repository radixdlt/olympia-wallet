<template>
  <div data-ci="wallet-view" class="flex flex-row h-screen relative">
    <wallet-sidebar-default
      :activeAccount="activeAccount"
      :activeView="view"
      :nameIndex="accountNameIndex"
      @open="sidebar = 'accounts'"
      @setView="setView"
      @verifyHardwareAddress="verifyHardwareWalletAddress"
    />
    <transition
      enter-active-class="transition ease-out duration-100 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-75 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <wallet-sidebar-accounts
        v-if="sidebar == 'accounts'"
        :accounts="accounts"
        :activeAccount="activeAccount"
        :hardwareAddress="hardwareAddress"
        @back="sidebar = 'default'"
        @addAccount="() => { addAccount() ; view = 'editName' }"
        @switchAccount="switchAccount"
        @switchToHardwareAccount="connectHardwareWallet"
        @editName="setView('editName')"
        @connectHardwareWallet="connectHardwareWallet"
        @verifyHardwareAddress="verifyHardwareWalletAddress"
      />
    </transition>

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
          @verifyHardwareAddress="verifyHardwareWalletAddress"
        />
        <wallet-loading v-else />
      </template>

      <template v-if="view == 'transaction'">
        <wallet-transaction
          v-if="!loadingBalances"
          :activeAddress="activeAddress"
          :tokenBalances="tokenBalances.tokenBalances"
          :nativeToken="nativeToken"
          @transferTokens="transferTokens"
          ref="walletTransactionComponent"
          @verifyHardwareAddress="verifyHardwareWalletAddress"
        />
        <wallet-loading v-else />
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
        />
        <wallet-loading v-else />
      </template>

      <template v-if="view == 'history'">
        <wallet-history
          v-if="!loadingHistory"
          :transactions="transactionHistory.transactions"
          :activeAddress="activeAddress"
          :pendingTransactions="pendingTransactions"
          :canGoBack="cursorStack.length > 0"
          :canGoNext="canGoNext"
          :loadingHistoryPage="loadingHistoryPage"
          :nativeToken="nativeToken"
          :decryptedMessages="decryptedMessages"
          @refresh="refreshHistory"
          @next="nextPage"
          @previous="previousPage"
          @decryptMessage="decryptMessage"
          @verifyHardwareAddress="verifyHardwareWalletAddress"
        />
        <wallet-loading v-else />
      </template>

      <wallet-confirm-transaction-modal
        v-if="shouldShowConfirmation"
        :activeAddress="activeAddress"
        :transferInput="transferInput"
        :stakeInput="stakeInput"
        :transactionFee="transactionFee"
        :selectedCurrency="selectedCurrency"
        :nativeToken="nativeToken"
        :confirmationMode="confirmationMode"
        :transactionState="transactionState"
        :activeMessage="activeMessageInTransaction"
        @cancel="cancelTransaction"
        @confirm="confirmTransaction"
      />

      <account-edit-name
        v-if="view == 'editName'"
        :activeAddress="activeAddress"
        @saved="accountRenamed"
      />

      <wallet-ledger-verify-address-modal
      v-if="showLedgerVerify"
      :hardwareError="ledgerVerifyError"
      :hardwareAddress="hardwareAddress"
      @dismissVerify="showLedgerVerify = false"
    />

      <settings-index v-if="view == 'settings' && !loading" />
      <wallet-ledger-interaction-modal
        v-if="hardwareInteractionState && hardwareInteractionState.length > 0"
        :hardwareWalletError="hardwareWalletError"
        @closeLedgerModal="hardwareInteractionState = null"
        @retryLedgerAccountDerivation="connectHardwareWallet"
      />
    </template>
    <template v-else>
      <wallet-loading />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onUnmounted, Ref } from 'vue'
import { Subscription, interval, Subject, Observable, combineLatest, from, BehaviorSubject, ReplaySubject, firstValueFrom } from 'rxjs'
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
  MessageInTransaction,
  ExecutedTransaction,
  Network
} from '@radixdlt/application'
import { safelyUnwrapAmount } from '@/helpers/validateRadixTypes'
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
import WalletLedgerInteractionModal from '@/views/Wallet/WalletLedgerInteractionModal.vue'
import { filter, mergeMap } from 'rxjs/operators'
import {
  getDerivedAccountsIndex,
  saveDerivedAccountsIndex,
  saveHardwareWalletAddress,
  getHardwareWalletAddress,
  saveAccountName
} from '@/actions/vue/data-store'
import { useI18n } from 'vue-i18n'
import { sendAPDU } from '@/actions/vue/hardware-wallet'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'
import WalletLedgerVerifyAddressModal from '@/views/Wallet/WalletLedgerVerifyAddressModal.vue'

const PAGE_SIZE = 50

export interface PendingTransaction extends TransactionStateSuccess {
  actions: IntendedAction[]
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
    WalletLoading,
    WalletLedgerInteractionModal,
    WalletLedgerVerifyAddressModal
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
    const hardwareAccount: Ref<AccountT | null> = ref(null)
    const activeAddress: Ref<AccountAddressT | null> = ref(null)
    const activeStakes: Ref<StakePositions | null> = ref(null)
    const activeUnstakes: Ref<UnstakePositions | null> = ref(null)
    const accounts: Ref<AccountsT | null> = ref(null)
    const tokenBalances: Ref<TokenBalances | null> = ref(null)
    const transactionHistory: Ref<TransactionHistory> = ref({ transactions: [] })
    const decryptedMessages = ref([])

    const activeMessageInTransaction: Ref<MessageInTransaction | null> = ref(null)
    const shouldShowConfirmation: Ref<boolean> = ref(false)
    const confirmationMode: Ref<string | null> = ref(null)
    const transferInput: Ref<TransferTokensInput | null> = ref({})
    const stakeInput: Ref<StakeTokensInput | null> = ref({})
    const transactionFee: Ref<AmountT> = ref(safelyUnwrapAmount(0))
    const hasCalculatedFee: Ref<boolean> = ref(false)
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
    const showLedgerVerify: Ref<boolean> = ref(false)
    const ledgerVerifyError: Ref<Error | null> = ref(null)
    const ledgerTxError: Ref<Error | null> = ref(null)

    // a dirty trick to get the account list item in the default wallet sidebar when the name changes
    const accountNameIndex: Ref<number> = ref(0)
    const loadingBalances: Ref<boolean> = ref(true)
    const loadingHistory: Ref<boolean> = ref(true)
    const loadingHistoryPage: Ref<boolean> = ref(true)

    // can be building, confirm, submitting
    const transactionState: Ref<string> = ref('confirm')

    const walletTransactionComponent = ref(null)
    const walletStakingComponent = ref(null)
    const hardwareInteractionState: Ref<string> = ref('')

    const userDidConfirm = new Subject<boolean>()
    const userDidCancel = new Subject<boolean>()
    let userConfirmation = new ReplaySubject<ManualUserConfirmTX>()
    const historyPagination = new Subject<TransactionHistoryOfKnownAddressRequestInput>()
    const faucetParams = new Subject<number>()

    const hardwareAddress: Ref<string> = ref('')
    const hardwareWalletError: Ref<Error | null> = ref(null)
    getHardwareWalletAddress().then(a => { hardwareAddress.value = a })

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
      .create({ network: Network.STOKENET })
      .connect(process.env.VUE_APP_API || 'https://stokenet.radixdlt.com')
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
    subs.add(radix.accounts.subscribe((accountsRes: AccountsT) => { accounts.value = accountsRes }))
    subs.add(radix.activeAddress.subscribe((addressRes: AccountAddressT) => { activeAddress.value = addressRes }))

    radix.unstakingPositions.subscribe(unstakes => {
      activeUnstakes.value = unstakes
    })

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
      decryptedMessages.value = []
      startLoading()
      sidebar.value = 'default'
      radix.switchAccount({ toAccount: account })
    }

    const accountRenamed = () => {
      view.value = 'overview'
      sidebar.value = 'default'
      accountNameIndex.value = accountNameIndex.value + 1
    }

    const confirmTransaction = () => {
      if (activeAccount.value &&
      hardwareAccount.value &&
      activeAccount.value === hardwareAccount.value) {
        transactionState.value = 'hw-signing'
      }
      userDidConfirm.next(true)
      hasCalculatedFee.value = false
    }

    const cancelTransaction = () => {
      userDidCancel.next(true)
      hasCalculatedFee.value = false
    }

    // Fetch history when user navigates to next page and every 5 seconds
    const fetchTXHistoryTrigger = combineLatest<[TransactionHistoryOfKnownAddressRequestInput, number]>([
      historyPagination.asObservable(),
      interval(5 * 1_000)
    ])

    subs.add(fetchTXHistoryTrigger
      .pipe(
        mergeMap(([params]: [TransactionHistoryOfKnownAddressRequestInput, number]) => {
          return radix.transactionHistory(params)
        })
      )
      .subscribe((history: TransactionHistory) => {
        loadingHistory.value = false
        loadingHistoryPage.value = false
        if (history.cursor && history.transactions.length === PAGE_SIZE) canGoNext.value = true
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
      transactionState.value = 'building'
      shouldShowConfirmation.value = true
      // Subscribe to initial userConfirmation and display modal
      const createUserConfirmation = userConfirmation
        .subscribe((txnToConfirm: ManualUserConfirmTX) => {
          transactionToConfirm.value = txnToConfirm
          userDidConfirm.next(false)
          transactionState.value = 'confirm'
          transactionFee.value = txnToConfirm.txToConfirm.fee
          hasCalculatedFee.value = true
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
        .subscribe((event) => {
          userDidCancel.next(true)
          shouldShowConfirmation.value = false
          const isLedgerConnectedError = event.error.message.includes('No device found')
          if (isLedgerConnectedError) {
            ledgerTxError.value = event.error
          } else if (view.value === 'transaction' && !ledgerTxError) {
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
          draftTransaction.value = (res as TransactionStateSuccess).transactionState as TransactionIntent
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
            hasCalculatedFee.value = false
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
        hasCalculatedFee.value = false
      }

      userDidCancel.subscribe((didCancel: boolean) => {
        if (didCancel) {
          cleanupTransactionSubs()
          shouldShowConfirmation.value = false
          activeMessage.value = ''
          hasCalculatedFee.value = false
        }
      })

      subs.add(transactionDidComplete.subscribe((didComplete: boolean) => {
        if (didComplete) {
          cleanupTransactionSubs()
          activeMessage.value = ''
          hasCalculatedFee.value = false
          historyPagination.next({ size: PAGE_SIZE })
        }
      }))
    }

    const cleanupInputs = () => {
      transferInput.value = null
      stakeInput.value = null
    }

    // call transferTokens() with built options and subscribe to confirmation and results
    const transferTokens = (transferTokensInput: TransferTokensInput, message: MessageInTransaction, sc: TokenBalance) => {
      let pollTXStatusTrigger: Observable<unknown>
      cleanupInputs()
      transferInput.value = transferTokensInput
      selectedCurrency.value = sc
      activeMessage.value = message.plaintext
      activeMessageInTransaction.value = message
      confirmationMode.value = 'transfer'
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
      cleanupInputs()
      stakeInput.value = stakeTokensInput
      selectedCurrency.value = nativeTokenBalance.value
      confirmationMode.value = 'stake'

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
      cleanupInputs()
      stakeInput.value = unstakeTokensInput
      selectedCurrency.value = nativeTokenBalance.value
      confirmationMode.value = 'unstake'

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

    const decryptMessage = (tx: ExecutedTransaction) => {
      firstValueFrom(radix.decryptTransaction(tx)).then((val) => {
        decryptedMessages.value.push({ id: tx.txID.toString(), message: val })
      })
    }

    const requestFreeTokens = () => {
      const request = {
        jsonrpc: '2.0',
        method: 'faucet.request_tokens',
        id: 1,
        params: {
          address: activeAddress.value ? activeAddress.value.toString() : ''
        }
      }
      const baseUrl = process.env.VUE_APP_FAUCET || 'https://stokenet-faucet.radixdlt.com'
      subs.add(from(
        fetch(`${baseUrl}/faucet`, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      ).subscribe(() => { faucetParams.next(Math.random()) }))
    }

    const connectHardwareWallet = () => {
      if (hardwareAccount.value) {
        switchAccount(hardwareAccount.value)
        return
      }
      hardwareWalletError.value = null
      hardwareInteractionState.value = 'DERIVING'
      radix.deriveHWAccount({
        keyDerivation: 'next',
        hardwareWalletConnection: HardwareWalletLedger.create({
          send: sendAPDU
        }),
        alsoSwitchTo: true,
        verificationPrompt: !hardwareAddress.value
      }).subscribe((hwAccount: AccountT) => {
        activeAccount.value = hwAccount
        hardwareAccount.value = hwAccount
        if (!hardwareAddress.value) {
          saveHardwareWalletAddress(hwAccount.address.toString())
          saveAccountName(hwAccount.address.toString(), 'Hardware Wallet')
          hardwareAddress.value = hwAccount.address.toString()
        }
        sidebar.value = 'default'
        hardwareInteractionState.value = ''
      },
      (err) => { hardwareWalletError.value = err })
    }

    const verifyHardwareWalletAddress = () => {
      radix.displayAddressForActiveHWAccountOnHWDeviceForVerification()
        .subscribe({
          error: (e) => { ledgerVerifyError.value = e }
        })
      showLedgerVerify.value = true
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      // data
      accounts,
      activeAccount,
      hardwareAccount,
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
      loadingHistoryPage,
      transactionState,
      activeMessage,
      activeMessageInTransaction,
      radix,
      confirmationMode,
      hardwareAddress,
      hardwareWalletError,
      hardwareInteractionState,
      decryptedMessages,
      accountNameIndex,
      showLedgerVerify,
      ledgerVerifyError,
      ledgerTxError,

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
      verifyHardwareWalletAddress,
      decryptMessage,
      accountRenamed,

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
