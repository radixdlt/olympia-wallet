<template>
  <div class="w-54 px-5 py-8 text-white overflow-y-auto fixed left-0 h-full bg-rBlueDark z-30 overflow-x-hidden">
    <div @click="$emit('back')" class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center mb-4">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
        <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current" />
        <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
      </svg>
      {{ $t('wallet.back') }}
    </div>

    <div class="mt-3 mb-6">
      {{ $t('wallet.chooseAnAccount') }}
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
        <div class="flex justify-between">

          <a class="flex cursor-pointer"
            @click="$emit('switchToHardwareAccount')"
            @mouseover="showHardwareHelper = true"
            @mouseleave="showHardwareHelper = false">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.7382 10.6172H7.26074V19H18.7382V10.6172Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M10.6592 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M15.3405 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M1.45471 18.9997H24.5453V21.4505C24.5453 23.4596 22.9165 25.0883 20.9074 25.0883H5.09253C3.08342 25.0883 1.45471 23.4596 1.45471 21.4505V18.9997Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M24.5449 7L1.45438 7V4.54926C1.45438 2.54016 3.08309 0.91145 5.09219 0.91145L20.9071 0.91145C22.9162 0.91145 24.5449 2.54016 24.5449 4.54926V7Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            </svg>

            <span class="text-white ml-2"> {{ $t('wallet.hardwareWalletHeading') }} </span>
          </a>
          <div class="text-white hover:text-rGreen transition-colors cursor-pointer flex items-center" @click="$emit('deleteHWWalletPrompt')">
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.78758 13.5C4.11396 13.5 1.15231 10.5809 1.15231 7C1.15231 3.41913 4.11396 0.5 7.78758 0.5C11.4612 0.5 14.4229 3.41913 14.4229 7C14.4229 10.5809 11.4612 13.5 7.78758 13.5Z" class="stroke-current" />
              <path d="M9.94199 2.99976L5.39062 7.46484L7.28703 9.32529L11.8384 4.86021L9.94199 2.99976Z" class="fill-current" />
              <path d="M4.72949 9.99967L6.68661 9.91411L4.79018 8.05371L4.72949 9.99967Z" class="fill-current" />
            </svg>
          </div>
        </div>

        <div class="text-xs text-white relative z-20 flex justify-between mt-4">
          <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
          <span class="flex-1 w-full truncate font-mono">{{ displayHardwareAddress }}</span>
          <click-to-copy
              :address="hardwareAddress"
              :checkForHardwareAddress=true
              @verifyHardwareAddress="$emit('verifyHardwareAddress')"
            />
        </div>
      </div>

      <div v-else
        @click="$emit('connectHardwareWallet')"
        class="group"
      >
        <div class="inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
          {{ $t('wallet.navAddHWWallet') }}
        </div>

        <div class="hidden group-hover:block text-xs mt-4">
          <p class="w-48">Please ensure your Ledger is connected and the Radix application is selected.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountsT, AccountT } from '@radixdlt/application'
import AccountListItem from '@/components/AccountListItem.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'

const WalletSidebarAccounts = defineComponent({
  components: {
    AccountListItem,
    ClickToCopy
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
    }
  },

  data () {
    return {
      showHardwareHelper: false
    }
  },

  computed: {
    displayHardwareAddress () {
      if (!this.hardwareAddress) { return '' }

      const add:string = this.hardwareAddress
      return add.substring(0, 3) + '...' + add.substring(add.length - 9)
    }
  },

  emits: ['back', 'addAccount', 'switchAccount', 'editName', 'addHardwareWallet', 'connectHardwareWallet', 'switchToHardwareAccount', 'verifyHardwareAddress', 'deleteHWWalletPrompt']
})

export default WalletSidebarAccounts
</script>
