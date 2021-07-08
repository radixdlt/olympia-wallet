<template>
  <div class="w-54 px-5 py-8 mt-2 text-white overflow-y-scroll">
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
      :shouldShowEdit="true"
      @click="$emit('switchAccount', account)"
      @edit="$emit('editName', account)"
      class="mb-8"
    >
    </account-list-item>

    <div @click="$emit('addAccount')" class="mt-3 mb-4 inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
      {{ $t('wallet.addAccount') }}
    </div>
    <br />

    <div class="border-t border-rGray border-opacity-50 pt-4">
      <div v-if="hardwareAddress" class="mt-2">
        <a class="flex cursor-pointer"
          @click="$emit('switchToHardwareAccount')"
          @mouseover="showHardwareHelper = true"
          @mouseleave="showHardwareHelper = false">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.7382 10.6172H7.26074V18.4568H18.7382V10.6172Z" stroke="white" stroke-miterlimit="10"/>
            <path d="M10.6592 12.5947V16.4793" stroke="white" stroke-miterlimit="10"/>
            <path d="M15.3408 12.5947V16.4793" stroke="white" stroke-miterlimit="10"/>
            <path d="M1.45508 19H24.5456V21.4507C24.5456 23.4598 22.9169 25.0886 20.9078 25.0886H5.09289C3.08379 25.0886 1.45508 23.4598 1.45508 21.4507V19Z" fill="none" stroke="white" stroke-miterlimit="10"/>
            <path d="M24.5449 7L1.45437 7V4.54926C1.45437 2.54016 3.08309 0.91145 5.09219 0.91145L20.9071 0.91145C22.9162 0.91145 24.5449 2.54016 24.5449 4.54926V7Z" fill="none" stroke="white" stroke-miterlimit="10"/>
          </svg>

          <span class="text-white ml-2"> {{ $t('wallet.hardwareWalletHeading') }} </span>
        </a>

        <div class="text-xs text-white relative z-20 flex justify-between mt-4">
          <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
          <span class="flex-1 w-full truncate">{{ displayHardwareAddress }}</span>
          <button @click="showLedgerVerify = true; $emit('verifyHardwareAddress')" class="cursor-pointer flex items-center active:text-rBlack outline-none focus:outline-none hover:text-rGreen active:text-rGreenDark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7.5" y="7.5" width="7" height="7" class="stroke-current"/>
              <path d="M13 5H5V13" class="stroke-current"/>
            </svg>
          </button>
        </div>
       </div>

      <div v-else
        @click="$emit('connectHardwareWallet')"
        @mouseover="showHardwareHelper = true"
        @mouseleave="showHardwareHelper = false"
        class="inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
        {{ $t('wallet.navAddHWWallet') }}
      </div>

      <div v-if="showHardwareHelper && !hardwareWalletError" class="w-48 text-xs mt-4">
        Please ensure your Ledger is connected and the Radix application is selected.
      </div>

      <div v-if="hardwareWalletError" class="w-48 text-xs mt-4">
        We're encountered an error communicating with your Ledger device. Please ensure the Ledger is connected adn the Radix application is select.
      </div>
    </div>
  </div>

  <wallet-ledger-verify-address-modal
    v-if="showLedgerVerify"
    :hardwareAddress="hardwareAddress"
    @dismissVerify="showLedgerVerify = false"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountsT, AccountT } from '@radixdlt/application'
import AccountListItem from '@/components/AccountListItem.vue'
import WalletLedgerVerifyAddressModal from '@/views/Wallet/WalletLedgerVerifyAddressModal.vue'

const WalletSidebarAccounts = defineComponent({
  components: {
    AccountListItem,
    WalletLedgerVerifyAddressModal
  },

  props: {
    accounts: {
      type: Object as PropType<AccountsT>,
      required: true
    },
    activeAccount: {
      type: Object as PropType<AccountT>,
      required: true
    },
    hardwareAddress: {
      type: String,
      required: false
    },
    hardwareWalletError: {
      type: Object as PropType<Error>,
      required: false
    }
  },

  data () {
    return {
      showHardwareHelper: false,
      showLedgerVerify: false
    }
  },

  computed: {
    displayHardwareAddress () {
      if (!this.hardwareAddress) { return '' }

      const add:string = this.hardwareAddress
      return add.substring(0, 8) + '...' + add.substring(add.length - 8)
    }
  },

  emits: ['back', 'addAccount', 'switchAccount', 'editName', 'addHardwareWallet', 'connectHardwareWallet', 'switchToHardwareAccount', 'verifyHardwareAddress']
})

export default WalletSidebarAccounts
</script>
