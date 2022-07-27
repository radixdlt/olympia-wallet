<template>
  <div class="bg-white flex flex-col rounded-md w-full h-96">
    <div class="pt-6 px-6 rounded-md">
      <div class="text-rGrayDark">
        <p>{{ $t('settings.noAccountsToShowMessageTop') }}</p>
        <p>{{ $t('settings.noAccountsToShowMessageBottom') }}</p>
      </div>
      <div v-if="hiddenAccounts.length">
        <div>
           <!-- <p>{{ $t('settings.hiddenAccountsLabel') }}</p> -->
           <p v-for="account in hiddenAccounts" :key="account" @click="showAccount(account)" class="cursor-pointer">
          {{ account }}
           </p>
        </div>
      </div>
    </div>
    <div>
      <p></p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import ClickToCopy from '@/components/ClickToCopy.vue'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { hiddenAccounts, handleShowAccounts } = useWallet(router)

    const showAccount = (account: string) => {
      handleShowAccounts(account)
    }
    return {
      hiddenAccounts,
      showAccount
    }
  }
})
</script>
