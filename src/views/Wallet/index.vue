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

      <wallet-history
        v-if="view == 'history'"
        :transactions="transactionHistory.transactions"
        :activeAddress="activeAddress"
      >
      </wallet-history>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountT, AccountsT, AddressT } from '@radixdlt/account'
import { Radix, StakePositions, TokenBalances, UnstakePositions } from '@radixdlt/application'
import { Subscription, interval } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import WalletOverview from './WalletOverview.vue'
import WalletHistory from './WalletHistory.vue'
import WalletSidebarAccounts from './WalletSidebarAccounts.vue'
import WalletSidebarDefault from './WalletSidebarDefault.vue'
import { mockedAPI } from '@/mockRadix'

const Wallet = defineComponent({
  components: {
    WalletOverview,
    WalletHistory,
    WalletSidebarAccounts,
    WalletSidebarDefault
  },

  setup () {
    const activeAccount = ref(null)
    const activeAddress = ref(null)
    const activeStakes = ref(null)
    const activeUnstakes = ref(null)
    const accounts = ref(null)
    const tokenBalances = ref(0.01)
    const transactionHistory = ref(null)
    const store = useStore()
    const router = useRouter()

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const mockAPI = mockedAPI
    const radix = Radix
      .create()
      .__withAPI(mockAPI)
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

    return { accounts, activeAccount, activeAddress, activeStakes, activeUnstakes, tokenBalances, addAccount, transactionHistory, switchAccount }
  },

  data () {
    return {
      view: 'overview',
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
