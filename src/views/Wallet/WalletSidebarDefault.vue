<template>
  <div class="w-60 px-5 py-8 flex flex-col">
    <div class="flex">
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
    </div>

    <div class="flex flex-col text-white hover:text-rGreen transition-colors cursor-pointer mb-4" @click="$emit('open')">
      <div class="relative py-3">
        <account-list-item
          :account="activeAccount"
          :activeAccount="activeAccount"
        />
        <div class="absolute bg-gradient-to-r from-blueEnd to-transparent inset-0 w-full h-full z-10 -mx-8 opacity-40">
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1">
      <div
        class="flex flex-row items-center my-5 cursor-pointer transition-opacity"
        :class="{ 'opacity-70': activeView !== 'overview' }"
        @click="$emit('setView', 'overview')"
      >
       <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
        <path d="M6.47401 13.5557L6.73695 14.4763C6.73703 16.0568 5.45579 17.3379 3.87531 17.3379C2.29491 17.3379 1.01367 16.0567 1.01367 14.4763L1.24568 13.6037" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M22.9721 13.541L23.235 14.4616C23.2351 16.0421 21.9538 17.3233 20.3734 17.3233C18.7929 17.3233 17.5117 16.042 17.5117 14.4616L17.7437 13.5891" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M12.1064 22.9783V19.6475" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M3.94141 23.5H20.2708" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M12.1064 16.7533V0" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M23.1966 14.3256L20.2714 4.08594H3.94202L1 14.4617" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M20.2711 4.08594L17.5117 14.4617" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M6.72266 14.4617L3.94141 4.08594" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>

        <div class="font-normal text-white">{{ $t('wallet.navBalances') }}</div>
      </div>

      <div
        class="flex flex-row items-center my-5 cursor-pointer transition-opacity"
        :class="{ 'opacity-70': activeView !== 'transaction' }"
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
        class="flex flex-row items-center my-5 cursor-pointer transition-opacity"
        :class="{ 'opacity-70': activeView !== 'staking' }"
        @click="$emit('setView', 'staking')"
      >
        <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M3.85449 10.1179V7.65369C3.85449 4.29719 6.57551 1.57617 9.93201 1.57617C13.2885 1.57617 16.0095 4.29719 16.0095 7.65369V10.1179" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M1.57617 24.1513V9.92188H4.0387H15.875H18.3376V23.4034H5.06131" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        </svg>
        <div class="font-normal text-white">{{ $t('wallet.navStake') }}</div>
      </div>

      <div
        class="flex flex-row items-center my-5 cursor-pointer transition-opacity"
        :class="{ 'opacity-70': activeView !== 'history' }"
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
      <a
        href="https://learn.radixdlt.com/article/betanet-desktop-wallet-introduction"
        target="__blank"
        class="flex flex-row items-center my-2 cursor-pointer transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M11.528 14.224V11.552C12.4667 11.52 13.192 11.2907 13.704 10.864C14.2267 10.4373 14.488 9.86667 14.488 9.152V8.848C14.488 8.24 14.296 7.75467 13.912 7.392C13.528 7.01867 13 6.832 12.328 6.832C11.6347 6.832 11.0853 7.01333 10.68 7.376C10.2853 7.73867 10.008 8.224 9.848 8.832L9 8.528C9.10667 8.16533 9.25067 7.82933 9.432 7.52C9.624 7.21067 9.85333 6.944 10.12 6.72C10.3973 6.496 10.7227 6.32 11.096 6.192C11.4693 6.064 11.8907 6 12.36 6C13.3307 6 14.0933 6.26667 14.648 6.8C15.2027 7.33333 15.48 8.05333 15.48 8.96C15.48 9.45067 15.4 9.888 15.24 10.272C15.08 10.6453 14.856 10.9707 14.568 11.248C14.2907 11.5147 13.9653 11.728 13.592 11.888C13.2293 12.048 12.84 12.16 12.424 12.224V14.224H11.528ZM11.976 17.504C11.72 17.504 11.528 17.44 11.4 17.312C11.2827 17.184 11.224 17.008 11.224 16.784V16.608C11.224 16.384 11.2827 16.208 11.4 16.08C11.528 15.952 11.72 15.888 11.976 15.888C12.2427 15.888 12.4347 15.952 12.552 16.08C12.68 16.208 12.744 16.384 12.744 16.608V16.784C12.744 17.008 12.68 17.184 12.552 17.312C12.4347 17.44 12.2427 17.504 11.976 17.504Z" fill="#DDE5ED"/>
          <circle cx="12" cy="12" r="11.5" stroke="#DDE5ED"/>
        </svg>

        <div class="font-normal text-white">{{ $t('wallet.navHelp') }}</div>
      </a>
    </div>

    <div class="flex flex-col">
      <div
        class="flex flex-row items-center my-2 cursor-pointer transition-opacity"
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
import { AccountT } from '@radixdlt/application'

const WalletSidebarDefault = defineComponent({
  components: {
    AccountListItem
  },

  props: {
    activeAccount: Object as PropType<AccountT>,
    activeView: String
  },

  emits: ['open', 'setView', 'openHelp']
})

export default WalletSidebarDefault
</script>
