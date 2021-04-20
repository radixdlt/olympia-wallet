<template>
  <div class="w-72 mx-5 py-8 flex flex-col">
    <div>
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
    </div>

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

    <div class="flex flex-col flex-1">
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
        :class="{ 'opacity-40': activeView !== 'transaction' }"
        @click="$emit('setView', 'transaction')"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M0 10.7441H15.5762" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M5.94873 5.75879H21.5982" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M5.93506 15.7588H21.579" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M15.8271 0.75H21.5982" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M15.8271 20.75H21.5982" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M18.0728 10.7441H21.5985" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        </svg>
        <div class="font-normal text-white">{{ $t('wallet.navTransaction') }}</div>
      </div>

      <div
        class="flex flex-row items-center my-8 cursor-pointer transition-opacity"
        :class="{ 'opacity-40': activeView !== 'staking' }"
        @click="$emit('setView', 'staking')"
      >
        <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M3.85449 10.1179V7.65369C3.85449 4.29719 6.57551 1.57617 9.93201 1.57617C13.2885 1.57617 16.0095 4.29719 16.0095 7.65369V10.1179" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M1.57617 24.1513V9.92188H4.0387H15.875H18.3376V23.4034H5.06131" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        </svg>
        <div class="font-normal text-white">{{ $t('wallet.navStake') }}</div>
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

    <div class="flex flex-col">
      <div
        class="flex flex-row items-center my-8 cursor-pointer transition-opacity"
        :class="{ 'opacity-40': activeView !== 'settings' }"
        @click="$emit('setView', 'settings')"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M21.0003 13.0001V8.99997H18.2223C18.0571 8.40186 17.8224 7.83417 17.5227 7.30598L19.4856 5.34296L16.6571 2.51449L14.6942 4.47752C14.1661 4.17779 13.5981 3.94319 13.0002 3.77781V1H9.00011V3.77781C8.40229 3.94312 7.83424 4.17772 7.30619 4.47752L5.34331 2.51442L2.51485 5.34289L4.47773 7.30591C4.17793 7.83367 3.9434 8.40179 3.77802 8.9999H1V13H3.77802C3.9434 13.5981 4.17793 14.1658 4.47766 14.694L2.51485 16.6567L5.34331 19.4852L7.30612 17.5225C7.83417 17.8222 8.40222 18.0568 9.00018 18.2222V21H13.0002V18.2222C13.5982 18.0568 14.1663 17.8222 14.6943 17.5225L16.6572 19.4852L19.4856 16.6567L17.5228 14.694C17.8225 14.1659 18.0571 13.5981 18.2223 13H21.0003V13.0001ZM11.0002 15C8.79105 15 7.00012 13.2092 7.00012 10.9998C7.00012 8.79077 8.79105 7.00005 11.0002 7.00005C13.2094 7.00005 15.0002 8.79084 15.0002 10.9998C15.0002 13.2092 13.2094 15 11.0002 15Z" stroke="white" stroke-miterlimit="10"/>
        </svg>

        <div class="font-normal text-white">{{ $t('wallet.navSettings') }}</div>
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
    activeAccount: Object as PropType<AccountT>,
    activeView: String
  },

  emits: ['open', 'setView']
})

export default WalletSidebarDefault
</script>
