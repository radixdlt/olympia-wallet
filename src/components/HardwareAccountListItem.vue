<template>
  <div class="px-5 bg-sidebar border-transparent border-l-4 group" :class="{'border-rGreen': isActiveAccount}">
    <div class="flex flex-row mb-4 justify-between" v-if="addressVal">
      <div class="flex flex-row">
        <div class="leading-snug text-rGrayDark hover:text-rGreen transition-colors cursor-pointer w-40 truncate">{{ nickName }}</div>
      </div>
      <div v-if="shouldShowEdit" @click.stop="editName" class="z-20 hidden group-hover:block text-rGrayDark hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center  pt-2 z-20">
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="stroke-current" d="M7.30515 -5.35835e-06L0.926422 6.37872L3.58423 9.03653L9.96296 2.6578L7.30515 -5.35835e-06Z" fill="white"/>
          <path class="stroke-current" d="M0 9.99999L2.7429 9.87776L0.0850602 7.22003L0 9.99999Z" fill="white"/>
        </svg>
      </div>
      <div @click="hideAccount" class="hidden text-rGrayDark hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center pt-1">
        <svg class="" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="stroke-current" d="M6.25909 2.91429C6.66583 2.81909 7.08226 2.77149 7.5 2.77248C11.6364 2.77248 14 7.49975 14 7.49975C13.6413 8.17079 13.2135 8.80255 12.7236 9.38475M11.01 11.0097C9.99989 11.7797 8.76993 12.2063 7.5 12.227C3.36364 12.227 1 7.49975 1 7.49975C1.73503 6.12996 2.75449 4.9332 3.99 3.98975L11.01 11.0097Z" stroke="#7A99AC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M1 1L14 14" stroke="#7A99AC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M9.26777 9.26796C9.03562 9.5001 8.76002 9.68425 8.45671 9.80989C8.15339 9.93553 7.8283 10.0002 7.5 10.0002C7.1717 10.0002 6.84661 9.93552 6.54329 9.80989C6.23998 9.68425 5.96438 9.5001 5.73223 9.26796C5.50009 9.03581 5.31594 8.76021 5.1903 8.4569C5.06466 8.15358 5 7.82849 5 7.50019C5 7.17188 5.06466 6.84679 5.1903 6.54348C5.31594 6.24017 5.50009 5.96457 5.73223 5.73242" stroke="#7A99AC"/>
          <path class="stroke-current" d="M6.9314 5.0655C7.34303 4.96937 7.77232 4.97919 8.17913 5.09404C8.58594 5.20888 8.95698 5.425 9.25758 5.72219C9.55818 6.01939 9.77851 6.38795 9.89798 6.79342C10.0175 7.1989 10.0322 7.62805 9.94073 8.04075" stroke="#7A99AC" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
    <div class="text-xs text-rGrayDark relative z-20 flex justify-between">
      <span class="flex-1 w-full truncate font-mono">{{ displayAddress }}</span>
      <click-to-copy
        :address="addressVal"
        :checkForHardwareAddress=true
        class="hover:text-rGreen active:text-rGreenDark"
        @verifyHardwareAddress="verifyHardwareWalletAddress()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, computed, ComputedRef } from 'vue'
import { AccountAddressT } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatWalletAddressForDisplay } from '@/helpers/formatter'
import { useWallet, useSidebar } from '@/composables'
import { useRouter } from 'vue-router'

const AccountListItem = defineComponent({
  components: {
    ClickToCopy
  },

  props: {
    address: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    shouldShowEdit: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  setup (props) {
    const router = useRouter()
    const { accountNameFor, activeAddress, verifyHardwareWalletAddress, setHideAccountModal } = useWallet(router)

    const { setState } = useSidebar()
    const address = toRef(props, 'address')

    const editName = () => {
      setState(false)
      router.push(`/wallet/${address.value?.toString()}/account-edit-name`)
    }

    const hideAccount = () => {
      setHideAccountModal(true)
    }

    const addressVal: ComputedRef<string> = computed(() => address.value.toString())
    const displayAddress: ComputedRef<string> = computed(() => formatWalletAddressForDisplay(address.value))

    const isActiveAccount: ComputedRef<boolean> = computed(() => {
      return address.value.toString() === activeAddress.value?.toString()
    })

    return {
      addressVal,
      displayAddress,
      nickName: computed(() => {
        if (!address.value) return ''
        const storedName = accountNameFor(address.value)
        return storedName || address.value.toString()
      }),
      activeAddress,
      editName,
      hideAccount,
      isActiveAccount,
      verifyHardwareWalletAddress
    }
  }
})

export default AccountListItem
</script>
