<template>
  <div>
    <div class="flex flex-row mb-4 justify-between">
      <div class="flex flex-row">
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-4 text-rGreen">
          <path d="M23.7138 12C23.7138 18.1997 18.5868 23.25 12.2319 23.25C5.87702 23.25 0.75 18.1997 0.75 12C0.75 5.80026 5.87702 0.75 12.2319 0.75C18.5868 0.75 23.7138 5.80026 23.7138 12Z" stroke="white" stroke-width="1.5" :class="{'fill-current': isActive}"/>
          <path d="M16.5562 14.6775C15.5805 13.5196 14.1053 12.7817 12.4544 12.7817C9.51673 12.7817 7.13525 15.118 7.13525 18" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M17.7733 18C17.7733 17.3288 17.6441 16.6871 17.4089 16.0977" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
          <path d="M12.4542 10.1432C13.9019 10.1432 15.0754 8.99183 15.0754 7.57158C15.0754 6.15133 13.9019 5 12.4542 5C11.0065 5 9.83289 6.15133 9.83289 7.57158C9.83289 8.99183 11.0065 10.1432 12.4542 10.1432Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
        </svg>

        <div class="font-medium leading-snug text-white hover:text-rGreen transition-colors cursor-pointer w-36 truncate">{{ nickName }}</div>
      </div>

      <div v-if="shouldShowEdit" class="text-white hover:text-rGreen transition-colors cursor-pointer flex items-center" @click="$emit('edit')">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.78758 13.5C4.11396 13.5 1.15231 10.5809 1.15231 7C1.15231 3.41913 4.11396 0.5 7.78758 0.5C11.4612 0.5 14.4229 3.41913 14.4229 7C14.4229 10.5809 11.4612 13.5 7.78758 13.5Z" class="stroke-current" />
          <path d="M9.94199 2.99976L5.39062 7.46484L7.28703 9.32529L11.8384 4.86021L9.94199 2.99976Z" class="fill-current" />
          <path d="M4.72949 9.99967L6.68661 9.91411L4.79018 8.05371L4.72949 9.99967Z" class="fill-current" />
        </svg>
      </div>
    </div>
    <div class="text-xs text-white relative z-20 flex justify-between">
      <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
      <span class="flex-1 w-full truncate font-mono">{{ displayAddress }}</span>
      <click-to-copy
        :address="address"
        :checkForHardwareAddress=true
        class="hover:text-rGreen active:text-rGreenDark"
        @verifyHardwareAddress="$emit('verifyHardwareAddress')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watchEffect, watch } from 'vue'
import { AccountT } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { ref } from '@nopr3d/vue-next-rx'
import { getAccountName } from '@/actions/vue/data-store'
import { formatWalletAddressForDisplay } from '@/helpers/formatter'

const AccountListItem = defineComponent({
  components: {
    ClickToCopy
  },

  props: {
    account: {
      type: Object as PropType<AccountT>,
      required: true
    },
    activeAccount: {
      type: Object as PropType<AccountT>,
      required: true
    },
    shouldShowEdit: {
      type: Boolean,
      required: false
    },
    nameIndex: {
      type: Number,
      required: false,
      default: 0
    }
  },

  setup (props) {
    const nickName = ref('')

    const fetchAccountName = (account: AccountT) => {
      getAccountName(account.address.toString())
        .then((storedName: string) => { nickName.value = storedName || account.address.toString() })
    }

    fetchAccountName(props.account)

    watch(() => props.nameIndex, () => {
      fetchAccountName(props.account)
    })

    watchEffect(() => {
      fetchAccountName(props.account)
    })
    return { nickName }
  },

  computed: {
    isActive () {
      const activeAccountKey: string = this.activeAccount?.hdPath ? this.activeAccount.hdPath.toString() : 'active'
      const accountKey: string = this.account?.hdPath ? this.account.hdPath.toString() : 'account'
      return activeAccountKey === accountKey
    },

    address (): string {
      return this.account.address.toString()
    },

    displayAddress (): string {
      return formatWalletAddressForDisplay(this.account.address)
    }
  },

  emits: ['edit', 'verifyHardwareAddress']
})

export default AccountListItem
</script>
