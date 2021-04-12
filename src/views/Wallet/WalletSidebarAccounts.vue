<template>
  <div class="w-72 mx-5 py-8 text-white">
    <div @click="$emit('back')" class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center mb-12">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
        <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current" />
        <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
      </svg>
      {{ $t('wallet.back') }}
    </div>

    <account-list-item
      v-for="(account, i) in accounts.all"
      :key="i"
      :account="account"
      :activeAccount="activeAccount"
      @click="$emit('switchAccount', account)"
      class="mb-8 text-white hover:text-rGreen transition-colors cursor-pointer"
    >
    </account-list-item>

    <div @click="$emit('addAccount')" class="mt-3 inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rGreen mr-2">
        <circle cx="12" cy="12" r="11.5" class="stroke-current"/>
        <line x1="12" y1="6" x2="12" y2="18" class="stroke-current"/>
        <line x1="6" y1="12.5" x2="18" y2="12.5" class="stroke-current"/>
      </svg>
      {{ $t('wallet.addAccount') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountsT, AccountT } from '@radixdlt/account'
import AccountListItem from '@/components/AccountListItem.vue'

const WalletSidebarDefault = defineComponent({
  components: {
    AccountListItem
  },

  props: {
    accounts: {
      type: Object as PropType<AccountsT>,
      required: true
    },
    activeAccount: {
      type: Object as PropType<AccountT>,
      required: true
    }
  },

  emits: ['back', 'addAccount', 'switchAccount']
})

export default WalletSidebarDefault
</script>
