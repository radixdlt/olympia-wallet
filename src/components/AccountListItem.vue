<template>
  <div>
    <div class="flex flex-row mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-4 text-rGreen">
        <circle cx="12" cy="12" r="11.5" stroke="white" :class="{'fill-current': isActive}" />
        <path d="M16.2423 14.677C15.2852 13.5191 13.8379 12.7812 12.2183 12.7812C9.33632 12.7812 7 15.1175 7 17.9995" stroke="white" stroke-miterlimit="10"/>
        <path d="M17.4366 17.9999C17.4366 17.3287 17.3099 16.687 17.0791 16.0977" stroke="white" stroke-miterlimit="10"/>
        <path d="M12.2181 11.1432C13.6383 11.1432 14.7897 9.99183 14.7897 8.57158C14.7897 7.15133 13.6383 6 12.2181 6C10.7978 6 9.64648 7.15133 9.64648 8.57158C9.64648 9.99183 10.7978 11.1432 12.2181 11.1432Z" :stroke="isActive ? '#FFFFFf': '#00C389'" stroke-miterlimit="10"/>
      </svg>

      <div class="font-medium leading-snug">My first account!</div>
    </div>
    <div class="text-xs text-rGrayMed relative z-20 flex justify-between">
      <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
      <span class="flex-1">{{ account.hdPath.toString() }}</span>
      <div @click.stop="copyText" class="pointer-events-auto cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="hover:text-rGray cursor-pointer">
          <path d="M10.0452 9.53031C9.33401 8.8191 9.33401 7.66599 10.0452 6.95478L11.7122 5.28776C12.4234 4.57655 13.5766 4.57655 14.2878 5.28776C14.999 5.99897 14.999 7.15208 14.2878 7.86329L12.6208 9.53027C11.9096 10.2416 10.7565 10.2416 10.0452 9.53031Z" class="stroke-current" stroke-miterlimit="10"/>
          <path d="M5.80254 13.7735C5.09133 13.0623 5.09133 11.9092 5.80254 11.1979L7.46956 9.53093C8.18077 8.81972 9.33388 8.81972 10.0451 9.53093C10.7563 10.2421 10.7563 11.3952 10.0451 12.1065L8.37812 13.7734C7.66695 14.4847 6.5138 14.4847 5.80254 13.7735Z" class="stroke-current" stroke-miterlimit="10"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountT } from '@radixdlt/account'
import { copyToClipboard } from '@/actions/vue/create-wallet'

const AccountListItem = defineComponent({
  props: {
    account: {
      type: Object as PropType<AccountT>,
      required: true
    },
    activeAccount: {
      type: Object as PropType<AccountT>,
      required: true
    }
  },

  computed: {
    isActive () {
      const activeAccountKey: string = this.activeAccount ? this.activeAccount.hdPath.toString() : 'active'
      const accountKey: string = this.account ? this.account.hdPath.toString() : 'account'
      return activeAccountKey === accountKey
    }
  },

  methods: {
    copyText () {
      copyToClipboard(this.account ? this.account.hdPath.toString() : '')
    }
  }
})

export default AccountListItem
</script>
