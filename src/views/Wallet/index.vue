<template>
  <div data-ci="wallet-view" class="flex flex-row min-h-screen">
    <wallet-sidebar-default
      v-if="sidebar == 'default'"
      @open="sidebar = 'accounts'"
    >
    </wallet-sidebar-default>

    <wallet-sidebar-accounts
      v-if="sidebar == 'accounts'"
      :accounts="accounts"
      @back="sidebar = 'default'"
    >
    </wallet-sidebar-accounts>

    <wallet-overview
      v-if="page == 'overview'"
      :tokenBalances="tokenBalances"
    >
    </wallet-overview>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountT, AccountsT } from '@radixdlt/account'
import { Radix, TokenBalances } from '@radixdlt/application'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import WalletOverview from './WalletOverview.vue'
import WalletSidebarAccounts from './WalletSidebarAccounts.vue'
import WalletSidebarDefault from './WalletSidebarDefault.vue'
import { mockedAPI } from '@/mockRadix'

const Wallet = defineComponent({
  components: {
    WalletOverview,
    WalletSidebarAccounts,
    WalletSidebarDefault
  },

  setup () {
    const activeAccount = ref(null)
    const accounts = ref(null)
    const tokenBalances = ref(0.01)
    const store = useStore()
    const router = useRouter()

    // Return home if wallet is undefined
    if (!store.state.wallet) router.push('/')

    const mockAPI = mockedAPI
    const radix = Radix
      .create()
      .__withAPI(mockAPI)
      .withWallet(store.state.wallet)
    const subs = new Subscription()

    radix.activeAccount
      .subscribe(
        (accountRes: AccountT) => {
          // console.log('active account returned from subscription', accountRes)
          activeAccount.value = accountRes
        },
        (e) => console.warn(e)
      )
      .add(subs)

    radix.accounts
      .subscribe(
        (accountsRes: AccountsT) => {
          // console.log('accounts returned from subscription', accountsRes)
          accounts.value = accountsRes
        },
        (e) => console.warn(e)
      )
      .add(subs)

    radix.tokenBalances
      .subscribe(
        (tokenBalancesRes: TokenBalances) => {
          console.log('accounts returned from subscription', tokenBalancesRes)
          tokenBalances.value = tokenBalancesRes
        }
      ).add(subs)

    return { accounts, activeAccount, tokenBalances }
  },

  data () {
    return {
      page: 'overview',
      sidebar: 'default'
    }
  }
})

export default Wallet
</script>
