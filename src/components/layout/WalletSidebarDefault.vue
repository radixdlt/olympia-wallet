<template>
  <div class="w-60  pt-8 flex flex-col h-full">
    <div class="mb-10 px-5">
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mr-3">
    </div>

    <div
      class="flex flex-col text-white hover:text-rGreen transition-colors cursor-pointer mb-2 px-5 bg-primaryAccount"
      @click="setState(true)"
    >
      <div class="relative py-3">
        <account-list-preview :address="activeAddress" v-if="activeAddress"/>
      </div>
    </div>

    <div class="flex flex-col flex-1 px-5" v-if="activeAddress">
      <router-link :to="{ name: 'WalletOverview', params: { activeAddress: activeAddress?.toString() }}" custom v-slot="{ href, navigate, isExactActive }">
        <wallet-nav-link :href="href" :navigate="navigate" :isActive="isExactActive" :title="$t('wallet.navBalances')">
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
            <path d="M6.47435 13.5559L6.73728 14.4765C6.73736 16.057 5.45613 17.3382 3.87565 17.3382C2.29524 17.3382 1.01401 16.0569 1.01401 14.4765L1.24602 13.604" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M22.9724 13.5411L23.2353 14.4618C23.2354 16.0423 21.9541 17.3234 20.3737 17.3234C18.7932 17.3234 17.512 16.0422 17.512 14.4618L17.744 13.5892" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M12.1068 22.9787V19.6478" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M3.94185 23.5H20.2713" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M12.1068 16.7533V0" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M23.1966 14.3256L20.2714 4.08594H3.94202L1 14.4617" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M20.2714 4.08594L17.512 14.4617" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M6.7231 14.4617L3.94185 4.08594" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          </svg>
        </wallet-nav-link>
      </router-link>

      <router-link :to="{ name: 'WalletHistory', params: { activeAddress: activeAddress?.toString() }}" custom v-slot="{ href, navigate, isActive }">
        <wallet-nav-link :href="href" :navigate="navigate" :isActive="isActive" :title="$t('wallet.navHistory')">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
            <path d="M1 13.3484V9.84839L19 9.84839V16.3484H1V22.8484H19V18.8484" stroke="white" stroke-width="1.5"/>
            <path d="M1 3.34839V6.84839H19V0.848389H0" stroke="#00C389" stroke-width="1.5"/>
          </svg>
        </wallet-nav-link>
      </router-link>
    </div>

    <div class="flex flex-col px-5">
      <a
        href="https://learn.radixdlt.com/article/start-here-desktop-wallet-introduction"
        target="__blank"
        class="flex flex-row items-center my-2 cursor-pointer transition-opacity"
      >
        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <path d="M11.496 14.8804V12.2564C12.3707 12.2137 13.0533 12.0004 13.544 11.6164C14.0453 11.2324 14.296 10.7044 14.296 10.0324V9.80839C14.296 9.26439 14.1253 8.83239 13.784 8.51239C13.4427 8.18172 12.984 8.01639 12.408 8.01639C11.7893 8.01639 11.2933 8.19239 10.92 8.54439C10.5573 8.89639 10.312 9.34439 10.184 9.88839L9 9.44039C9.096 9.09906 9.23467 8.77372 9.416 8.46439C9.608 8.14439 9.84267 7.86706 10.12 7.63239C10.408 7.38706 10.744 7.19506 11.128 7.05639C11.512 6.91772 11.9547 6.84839 12.456 6.84839C13.448 6.84839 14.232 7.12039 14.808 7.66439C15.384 8.20839 15.672 8.94439 15.672 9.87239C15.672 10.3844 15.5813 10.8324 15.4 11.2164C15.2293 11.5897 15.0053 11.9097 14.728 12.1764C14.4507 12.4431 14.136 12.6564 13.784 12.8164C13.432 12.9764 13.08 13.0884 12.728 13.1524V14.8804H11.496ZM12.12 18.4004C11.7787 18.4004 11.528 18.3151 11.368 18.1444C11.2187 17.9737 11.144 17.7497 11.144 17.4724V17.2644C11.144 16.9871 11.2187 16.7631 11.368 16.5924C11.528 16.4217 11.7787 16.3364 12.12 16.3364C12.4613 16.3364 12.7067 16.4217 12.856 16.5924C13.016 16.7631 13.096 16.9871 13.096 17.2644V17.4724C13.096 17.7497 13.016 17.9737 12.856 18.1444C12.7067 18.3151 12.4613 18.4004 12.12 18.4004Z" fill="white"/>
          <circle cx="12.5" cy="12.3484" r="11.5" stroke="#00C389" stroke-width="1.5"/>
        </svg>

        <div class="font-normal text-white">{{ $t('wallet.navHelp') }}</div>
      </a>
    </div>

    <div class="flex flex-col px-5">
      <router-link to="/settings" custom v-slot="{ href, navigate, isActive }">
        <wallet-nav-link :href="href" :navigate="navigate" :isActive="isActive" :title="$t('wallet.navSettings')">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
            <path d="M21.0003 8.84836V12.8485L19.5 12.8484L18.2223 12.8484C18.0571 13.4465 17.8225 14.0143 17.5228 14.5424L19.4856 16.5051L16.6572 19.3335L14.6943 17.3709C14.1663 17.6706 13.5982 17.9052 13.0002 18.0706V20.8484H9.00018V18.0706C8.40222 17.9052 7.83417 17.6706 7.30612 17.3709L5.34331 19.3335L2.51485 16.5051L4.47766 14.5424C4.17793 14.0142 3.9434 13.4465 3.77802 12.8484H1V8.84829H3.77802C3.9434 8.25018 4.17793 7.68206 4.47773 7.1543L2.51485 5.19128L5.34331 2.36281L7.30619 4.3259C7.83424 4.02611 8.40229 3.79151 9.00011 3.6262V0.848389H13.0002V3.6262C13.5981 3.79158 14.1661 4.02618 14.6942 4.3259L16.6571 2.36288L19.4856 5.19135L17.5227 7.15437C17.8224 7.68256 18.0571 8.25025 18.2223 8.84836H21.0003Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            <circle cx="11" cy="10.8484" r="3.75" stroke="white" stroke-width="1.5"/>
          </svg>
        </wallet-nav-link>
      </router-link>
    </div>
    <SidebarNetworkDisplay />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import AccountListPreview from '@/components/AccountListPreview.vue'
import WalletNavLink from './WalletNavLink.vue'
import { useWallet, useSidebar } from '@/composables'
import { useRouter, useRoute } from 'vue-router'
import SidebarNetworkDisplay from '@/components/SidebarNetworkDisplay.vue'

const WalletSidebarDefault = defineComponent({
  components: {
    SidebarNetworkDisplay,
    AccountListPreview,
    WalletNavLink
  },

  setup () {
    const router = useRouter()
    const { activeAddress } = useWallet(router)
    const { open, setState } = useSidebar()
    const route = useRoute()

    const isOverview = computed(() => route.name === 'WalletOverview')

    return {
      activeAddress,
      isOverview,
      open,
      route,
      setState
    }
  }
})

export default WalletSidebarDefault
</script>
