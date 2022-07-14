<template>
  <div :class="{'pl-4 pr-5 py-1 border-transparent border-l-4 group': true, 'border-rGreen': isActiveAccount }">
    <div class="flex justify-between" v-if="addressVal">
      <div class="flex-1">
        <div :class="{
          'leading-snug transition-colors cursor-pointer w-44 truncate text-sm mb-1': true,
          'text-rGreen': isActiveAccount,
          'text-rGrayDark hover:text-rGreen': !isActiveAccount
        }">
          <span class="flex-1 truncate">{{ nickName }}</span>
        </div>
        <span :class="{'text-xxs flex-1 w-full truncate font-mono': true, 'text-white': isActiveAccount, 'text-rGrayDark': !isActiveAccount }">{{ displayAddress }}</span>
      </div>
      <div>
        <div class="invisible flex group-hover:visible text-rGrayDark hover:text-rGreen transition-colors cursor-pointer items-start p-1 justify-center flex-0 pt-1" @click.stop="editName">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-current" d="M7.30515 -5.35835e-06L0.926422 6.37872L3.58423 9.03653L9.96296 2.6578L7.30515 -5.35835e-06Z" fill="white"/>
            <path class="stroke-current" d="M0 9.99999L2.7429 9.87776L0.0850602 7.22003L0 9.99999Z" fill="white"/>
          </svg>
        </div>
        <div class="text-xs text-rGrayDark pt-2">
          <click-to-copy
            :address="addressVal"
            :checkForHardwareAddress=true
            class="hover:text-rGreen active:text-rGreenDark mb-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, computed, ComputedRef } from 'vue'
import { AccountAddressT } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatWalletAddressForDisplay } from '@/helpers/formatter'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'

const AccountListItem = defineComponent({
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
    const { accountNameFor, activeAddress, setHideAccountModal, setActiveAccountAddress } = useWallet(router)

    const address = toRef(props, 'address')

    const editName = () => {
      // setState(false)
      router.push(`/wallet/${address.value?.toString()}/account-edit-name`)
    }

    const hideAccount = (addr: string, acctNickName: string) => {
      setHideAccountModal(true)
      setActiveAccountAddress(addr, acctNickName)
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
      isActiveAccount
    }
  }
})

export default AccountListItem
</script>
