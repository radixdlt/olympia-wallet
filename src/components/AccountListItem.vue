<template>
  <div :class="{'pl-4 pr-4 py-1 border-transparent border-l-4 group': true, 'border-rGreen': isActiveAccount }">
    <div class="flex justify-between" v-if="addressVal">
      <div class="flex-1">
        <div :class="{
          'leading-snug transition-colors cursor-pointer w-44 truncate text-sm mb-1 flex': true,
          'text-rGreen': isActiveAccount,
          'text-rGrayDark hover:text-rGreen': !isActiveAccount
        }">
          <span class="flex-1 truncate">{{ nickName }}</span>
        </div>
        <span :class="{'text-xxs flex-1 w-full truncate font-mono': true, 'text-white': isActiveAccount, 'text-rGrayDark': !isActiveAccount }">{{ displayAddress }}</span>
      </div>
      <div class="flex gap-1">
        <div class="flex items-start">
          <!-- pencil icon -->
          <div class="invisible flex group-hover:visible text-rGrayDark hover:text-rGreen transition-colors cursor-pointer items-center p-1 justify-center items:center flex-0 pb-2" @click.stop="editName">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.59916 -0.000175769L0.836914 5.65283L3.23785 8.00825L9.0001 2.35524L6.59916 -0.000175769Z" fill="#F2F2FC"/>
              <path d="M0 8.86212L2.47781 8.75379L0.0768395 6.39844L0 8.86212Z" fill="#F2F2FC"/>
            </svg>
          </div>
        </div>
        <div class="flex flex-col gap-2 justify-center items-center ">
          <!-- eye icon -->
          <div @click="hideAccount(addressVal, nickName)" class="text-rGrayDark hover:text-rGreen transition-colors cursor-pointer  ">
            <svg class="" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path class="stroke-current" d="M6.25909 2.91429C6.66583 2.81909 7.08226 2.77149 7.5 2.77248C11.6364 2.77248 14 7.49975 14 7.49975C13.6413 8.17079 13.2135 8.80255 12.7236 9.38475M11.01 11.0097C9.99989 11.7797 8.76993 12.2063 7.5 12.227C3.36364 12.227 1 7.49975 1 7.49975C1.73503 6.12996 2.75449 4.9332 3.99 3.98975L11.01 11.0097Z" stroke="#7A99AC" stroke-linecap="round" stroke-linejoin="round"/>
              <path class="stroke-current" d="M1 1L14 14" stroke="#7A99AC" stroke-linecap="round" stroke-linejoin="round"/>
              <path class="stroke-current" d="M9.26777 9.26796C9.03562 9.5001 8.76002 9.68425 8.45671 9.80989C8.15339 9.93553 7.8283 10.0002 7.5 10.0002C7.1717 10.0002 6.84661 9.93552 6.54329 9.80989C6.23998 9.68425 5.96438 9.5001 5.73223 9.26796C5.50009 9.03581 5.31594 8.76021 5.1903 8.4569C5.06466 8.15358 5 7.82849 5 7.50019C5 7.17188 5.06466 6.84679 5.1903 6.54348C5.31594 6.24017 5.50009 5.96457 5.73223 5.73242" stroke="#7A99AC"/>
              <path class="stroke-current" d="M6.9314 5.0655C7.34303 4.96937 7.77232 4.97919 8.17913 5.09404C8.58594 5.20888 8.95698 5.425 9.25758 5.72219C9.55818 6.01939 9.77851 6.38795 9.89798 6.79342C10.0175 7.1989 10.0322 7.62805 9.94073 8.04075" stroke="#7A99AC" stroke-linecap="round"/>
            </svg>
          </div>
          <!-- click to copy icon -->
          <div class="text-xs text-rGrayDark ">
            <click-to-copy
              :address="addressVal"
              :checkForHardwareAddress=true
              class="hover:text-rGreen active:text-rGreenDark"
            />
          </div>
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
