<template>
  <div data-ci="wallet-view" class="flex flex-row min-h-screen">
    <div class="w-72 mx-5 py-8">
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
    </div>

    <div class="bg-white pt-headerHeight pb-8 px-11 flex-1">
      <span v-if="!accounts">Loading...</span>
      Accounts: {{ accounts }}
      <br/>
      Active Account: {{ activeAccount }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountT, AccountsT } from '@radixdlt/account'
import { Radix } from '@radixdlt/application'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

const Wallet = defineComponent({
  setup () {
    const activeAccount = ref(null)
    const accounts = ref(null)
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

    return { accounts, activeAccount }
  }
})

export default Wallet
</script>
