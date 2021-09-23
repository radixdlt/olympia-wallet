<template>
  <div class="w-54 px-5 py-8 text-white overflow-y-auto fixed top-0 left-0 h-full bg-rBlueDark z-30 overflow-x-hidden">
    <div @click="setState(false)" class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center mb-4">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2" >
        <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current"  />
        <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
      </svg>
      {{ $t('wallet.back') }}
    </div>

    <div class="mt-3 mb-6">
      {{ $t('wallet.chooseAnAccount') }}
    </div>

    <account-list-item
      v-for="account in localAccounts"
      :key="account.address.toString()"
      :account="account"
      :activeAccount="activeAccount"
      :shouldShowEdit="true"
      @click="debugSwitch(account)"
      @edit="editName(account)"
      class="mb-8"
    >
    </account-list-item>

    <div @click="addAccount" class="mt-3 mb-4 inline-flex flex-row items-center cursor-pointer hover:text-rGreen transition-colors">
      {{ $t('wallet.addAccount') }}
    </div>
    <br />

    <div class="border-t border-rGray border-opacity-50 pt-4">
      <div v-if="hardwareAddress" class="mt-2">
        <div class="flex justify-between">

          <a class="flex cursor-pointer"
            @click="connectHardwareWallet"
            @mouseover="showHardwareHelper = true"
            @mouseleave="showHardwareHelper = false">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rGreen" :class="{'fill-current': isHardwareWalletActive}">
              <path d="M18.7382 10.6172H7.26074V19H18.7382V10.6172Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
              <path d="M10.6592 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
              <path d="M15.3405 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M1.45471 18.9997H24.5453V21.4505C24.5453 23.4596 22.9165 25.0883 20.9074 25.0883H5.09253C3.08342 25.0883 1.45471 23.4596 1.45471 21.4505V18.9997Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M24.5449 7L1.45438 7V4.54926C1.45438 2.54016 3.08309 0.91145 5.09219 0.91145L20.9071 0.91145C22.9162 0.91145 24.5449 2.54016 24.5449 4.54926V7Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            </svg>

            <span class="text-white ml-2"> {{ $t('wallet.hardwareWalletHeading') }} </span>
          </a>
          <div class="text-white hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center w-5 h-5" @click="showDeleteHWPrompt()">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" >
              <path d="M1.65912 5.23001L1.91 11H7.77L8.02275 5.23001" stroke="white" stroke-width="1.5"/>
              <path d="M0 3.21212H2.98M2.98 3.21212V1H6.7V3.21212M2.98 3.21212H6.7M6.7 3.21212H9.68" stroke="white" stroke-width="1.5"/>
            </svg>
          </div>
        </div>

        <div class="text-xs text-white relative z-20 flex justify-between mt-4">
          <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
          <span class="flex-1 w-full truncate font-mono">{{ displayHardwareAddress }}</span>
          <click-to-copy
              :address="hardwareAddress"
              :checkForHardwareAddress=true
              @verifyHardwareAddress="verifyHardwareWalletAddress"
            />
        </div>
      </div>

      <div v-else
        @click="connectHardwareWallet"
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
import { defineComponent, ref, computed, ComputedRef } from 'vue'
import { AccountT } from '@radixdlt/application'
import AccountListItem from '@/components/AccountListItem.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { useWallet, useSidebar } from '@/composables'
import { useRouter } from 'vue-router'

const WalletSidebarAccounts = defineComponent({
  components: {
    AccountListItem,
    ClickToCopy
  },

  setup () {
    const router = useRouter()
    const {
      activeAccount,
      allAccounts,
      addAccount,
      switchAccount,
      connectHardwareWallet,
      setDeleteHWWalletPrompt,
      hardwareAccount,
      hardwareAddress,
      derivedAccountIndex,
      activeNetwork,
      verifyHardwareWalletAddress
    } = useWallet(router)
    const { setState } = useSidebar()
    const showHardwareHelper = ref(false)

    const displayHardwareAddress: ComputedRef<string> = computed(() => {
      if (!hardwareAddress.value) return ''
      const add: string = hardwareAddress.value
      return add.substring(0, 3) + '...' + add.substring(add.length - 9)
    })

    const localAccounts: ComputedRef<AccountT[]> = computed(() => {
      if (!allAccounts.value) return []
      return allAccounts.value.filter((account: AccountT) => {
        return account.signingKey.isLocalHDSigningKey
      })
    })

    const isHardwareWalletActive: ComputedRef<boolean> = computed(() => {
      if (!hardwareAddress.value) { return false }
      return activeAccount.value?.address.toString() === hardwareAddress.value
    })

    return {
      allAccounts,
      activeAccount,
      derivedAccountIndex,
      activeNetwork,
      hardwareAccount,
      hardwareAddress,
      showHardwareHelper,
      displayHardwareAddress,
      localAccounts,
      setState,
      addAccount,
      switchAccount,
      isHardwareWalletActive,
      debugSwitch (account: AccountT) {
        switchAccount(account)
      },
      editName (account: AccountT) {
        setState(false)
        router.push('/wallet/account-edit-name')
        switchAccount(account)
      },
      connectHardwareWallet,
      verifyHardwareWalletAddress,
      showDeleteHWPrompt () {
        setDeleteHWWalletPrompt(true)
      }
    }
  }
})

export default WalletSidebarAccounts
</script>
