<template>
  <div class="bg-sidebar group">
    <div class="flex flex-row mb-4 justify-between" v-if="addressVal">
      <div class="flex flex-row">
        <div class="leading-snug text-white group-hover:text-rGray transition-colors cursor-pointer w-40 flex">
          <div class="truncate">{{ nickName }}</div>
        </div>
      </div>
      <div class="text-rGrayDark group-hover:text-rGreen transition-colors cursor-pointer flex items-center justify-center pr-1">
        <svg width="13" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="stroke-current" width="2" height="2" rx="1" fill="#7A99AC"/>
          <rect class="stroke-current" x="4" width="2" height="2" rx="1" fill="#7A99AC"/>
          <rect class="stroke-current" x="8" width="2" height="2" rx="1" fill="#7A99AC"/>
        </svg>
      </div>
    </div>
    <div class="text-xxs text-white relative flex justify-between">
      <span class="flex-1 w-full truncate font-mono">{{ displayAddress }}</span>
      <click-to-copy
        :address="addressVal"
        :checkForHardwareAddress=true
        class="text-rGrayDark group-hover:text-rGreen"
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
    }
  },

  setup (props) {
    const router = useRouter()
    const { accountNameFor, activeAddress } = useWallet(router)

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
      isActiveAccount
    }
  }
})

export default AccountListPreview
</script>
