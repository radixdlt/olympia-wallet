<template>
  <div class="w-72 mx-5 py-8 text-white">
    <div @click="$emit('back')" class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center mb-12">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
        <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current" />
        <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
      </svg>
      Back
    </div>

    <div v-for="(account, i) in accounts.all" :key="i" class="mb-8">
      <div class="flex flex-row mb-4">
          <img alt="Account" src="../../assets/account.svg" class="mr-4">
          <div class="font-medium leading-snug">My first account!</div>
        </div>
        <div class="text-xs text-rGrayMed relative z-20 flex justify-between">
          <span class="mr-2">addr:</span>
          <span class="flex-1">xxxxxxxxxxxxxxxxxxxxxxxx</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="hover:text-rGray cursor-pointer">
            <path d="M10.0452 9.53031C9.33401 8.8191 9.33401 7.66599 10.0452 6.95478L11.7122 5.28776C12.4234 4.57655 13.5766 4.57655 14.2878 5.28776C14.999 5.99897 14.999 7.15208 14.2878 7.86329L12.6208 9.53027C11.9096 10.2416 10.7565 10.2416 10.0452 9.53031Z" class="stroke-current" stroke-miterlimit="10"/>
            <path d="M5.80254 13.7735C5.09133 13.0623 5.09133 11.9092 5.80254 11.1979L7.46956 9.53093C8.18077 8.81972 9.33388 8.81972 10.0451 9.53093C10.7563 10.2421 10.7563 11.3952 10.0451 12.1065L8.37812 13.7734C7.66695 14.4847 6.5138 14.4847 5.80254 13.7735Z" class="stroke-current" stroke-miterlimit="10"/>
          </svg>
        </div>
    </div>

    <div @click="$emit('addAccount')" class="mt-3 inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rGreen mr-2">
        <circle cx="12" cy="12" r="11.5" class="stroke-current"/>
        <line x1="12" y1="6" x2="12" y2="18" class="stroke-current"/>
        <line x1="6" y1="12.5" x2="18" y2="12.5" class="stroke-current"/>
      </svg>
      Add Account
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountsT } from '@radixdlt/account'

const WalletSidebarDefault = defineComponent({
  props: {
    accounts: Object as PropType<AccountsT>
  },

  emits: ['back', 'addAccount']
})

export default WalletSidebarDefault
</script>
