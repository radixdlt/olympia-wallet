<template>
  <div class="w-72 mx-5 py-8">
    <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">

    <div class="flex flex-col text-white hover:text-rGreen transition-colors cursor-pointer mb-8" @click="$emit('open')">
      <div class="relative py-3">
        <account-list-item
          :account="activeAccount"
          :activeAccount="activeAccount"
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

    <div
      class="flex flex-row items-center my-8 cursor-pointer transition-opacity"
      :class="{ 'opacity-40': activeView !== 'overview' }"
      @click="$emit('setView', 'overview')"
    >
      <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
        <path d="M1 1H9.46735V8.93388H1.53347V4.26133" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M21.5291 1H13.5952V8.93388H21.5291V1Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M9.46757 13.0664H1.53369V21.0003H9.46757V13.0664Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M21.5291 13.0664H13.5952V21.0003H21.5291V13.0664Z" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>
      <div class="font-normal text-white">{{ $t('wallet.navBalances') }}</div>
    </div>

    <div
      class="flex flex-row items-center my-8 cursor-pointer transition-opacity"
      :class="{ 'opacity-40': activeView !== 'history' }"
      @click="$emit('setView', 'history')"
    >
      <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
        <path d="M1 1H9.46735V8.93388H1.53347V4.26133" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M21.5291 1H13.5952V8.93388H21.5291V1Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M9.46757 13.0664H1.53369V21.0003H9.46757V13.0664Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M21.5291 13.0664H13.5952V21.0003H21.5291V13.0664Z" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>
      <div class="font-normal text-white">{{ $t('wallet.navHistory') }}</div>
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
    activeAccount: Object as PropType<AccountT>,
    activeView: String
  },

  emits: ['open', 'setView']
})

export default WalletSidebarDefault
</script>
