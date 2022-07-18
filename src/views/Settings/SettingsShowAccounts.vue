<template>
  <div class="bg-white flex flex-col rounded-md w-full h-96">
    <div class="pt-6 px-6 rounded-md">
      <p>Hidden Accounts Go Here</p>
      <p v-for="account in hiddenAccounts" :key="account" @click="showAccount(account)" class="cursor-pointer">
        {{ account }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { hiddenAccounts } = useWallet(router)

    const showAccount = (account: string) => {
      console.log('before filtering --->', hiddenAccounts.value, account)
      // remove the selected account from hidden account
      const filteredHiddenAccounts = hiddenAccounts.value.filter((hiddenAccount: string) => {
        console.log(hiddenAccount, account, hiddenAccount === account)
        return hiddenAccount !== account
      })
      console.log('after filtering--->', filteredHiddenAccounts)
      // set hidden accounts to remaining accounts
    }
    return {
      hiddenAccounts,
      showAccount
    }
  }
})
</script>
