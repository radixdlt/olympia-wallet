<template>
  <div class="w-72 mx-5 py-8">
    <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">

    <div class="flex flex-col text-white hover:text-rGreen transition-colors cursor-pointer" @click="$emit('open')">
      <div class="relative py-3">
        <account-list-item
          :account="activeAccount"
        />
        <svg class="absolute top-0 right-0 z-20 mt-4" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="9" width="2" height="2" rx="1" class="fill-current"/>
          <rect x="9" y="9" width="2" height="2" rx="1" class="fill-current"/>
          <rect x="13" y="9" width="2" height="2" rx="1" class="fill-current"/>
        </svg>
        <div class="absolute bg-gradient-to-r from-blueEnd to-transparent inset-0 w-full h-full z-10 -mx-8 opacity-40">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AccountListItem from '@/components/AccountListItem.vue'
import { AccountT } from '@radixdlt/account'

const WalletSidebarDefault = defineComponent({
  components: {
    AccountListItem
  },

  props: {
    activeAccount: Object as PropType<AccountT>
  },

  emits: ['open']
})

export default WalletSidebarDefault
</script>
