<template>
  <div class=" bg-sidebar border-transparent border-l-4 text" :class="{'': isActiveAccount}">
    <div class="flex flex-row mb-4 justify-between" v-if="addressVal">
      <div class="flex flex-row">
        <div class="leading-snug text-rGreen text-lg hover:text-rGreen transition-colors cursor-pointer w-36 flex">
          <div class="truncate">{{ nickName }}</div>
          <div class="my-auto pl-2">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="4" r="4" fill="#00C389"/>
            </svg>
          </div>
        </div>
      </div>
      <div v-if="shouldShowEdit" class="hidden group-hover:block text-rGrayDark hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center w-5 h-5" @click="editName">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.30515 -5.35835e-06L0.926422 6.37872L3.58423 9.03653L9.96296 2.6578L7.30515 -5.35835e-06Z" fill="white"/>
          <path d="M0 9.99999L2.7429 9.87776L0.0850602 7.22003L0 9.99999Z" fill="white"/>
        </svg>
      </div>
      <div class="text-rGrayDark hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center pr-1">
        <svg width="13" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="stroke-current" width="2" height="2" rx="1" fill="#7A99AC"/>
          <rect class="stroke-current" x="4" width="2" height="2" rx="1" fill="#7A99AC"/>
          <rect class="stroke-current" x="8" width="2" height="2" rx="1" fill="#7A99AC"/>
        </svg>
      </div>
    </div>
    <div class="text-xs text-rGrayDark relative flex justify-between">
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

const AccountListPreview = defineComponent({
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
    const { accountNameFor, activeAddress, verifyHardwareWalletAddress } = useWallet(router)

    const { setState } = useSidebar()
    const address = toRef(props, 'address')

    const editName = () => {
      setState(false)
      router.push(`/wallet/${address.value?.toString()}/account-edit-name`)
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
      isActiveAccount,
      verifyHardwareWalletAddress
    }
  }
})

export default AccountListPreview
</script>
