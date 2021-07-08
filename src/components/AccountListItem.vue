<template>
  <div>
    <div class="flex flex-row mb-4 justify-between">
      <div class="flex flex-row">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-4 text-rGreen">
          <circle cx="12" cy="12" r="11.5" stroke="white" :class="{'fill-current': isActive}" />
          <path d="M16.2423 14.677C15.2852 13.5191 13.8379 12.7812 12.2183 12.7812C9.33632 12.7812 7 15.1175 7 17.9995" stroke="white" stroke-miterlimit="10"/>
          <path d="M17.4366 17.9999C17.4366 17.3287 17.3099 16.687 17.0791 16.0977" stroke="white" stroke-miterlimit="10"/>
          <path d="M12.2181 11.1432C13.6383 11.1432 14.7897 9.99183 14.7897 8.57158C14.7897 7.15133 13.6383 6 12.2181 6C10.7978 6 9.64648 7.15133 9.64648 8.57158C9.64648 9.99183 10.7978 11.1432 12.2181 11.1432Z" :stroke="isActive ? '#FFFFFf': '#00C389'" stroke-miterlimit="10"/>
        </svg>

        <div class="font-medium leading-snug text-white hover:text-rGreen transition-colors cursor-pointer w-36 truncate">{{ name }}</div>
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
      <span class="flex-1 w-full truncate">{{ displayAddress }}</span>
      <click-to-copy :text="address" class="hover:text-rGreen active:text-rGreenDark" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType } from 'vue'
import { AccountT } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { ref } from '@nopr3d/vue-next-rx'
import { getAccountName } from '@/actions/vue/data-store'
import { formatAddressForDisplay } from '@/helpers/formatter'

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
    }
  },

  setup (props) {
    const address = ref(null)
    const displayAddress = ref(null)
    const name = ref('')

    address.value = props.account.address.toString()
    displayAddress.value = formatAddressForDisplay(address.value)

    getAccountName(props.account.address.toString())
      .then((storedName: string) => { name.value = storedName || props.account.address.toString() })

    return { address, displayAddress, name }
  },

  computed: {
    isActive () {
      const activeAccountKey: string = this.activeAccount?.hdPath ? this.activeAccount.hdPath.toString() : 'active'
      const accountKey: string = this.account?.hdPath ? this.account.hdPath.toString() : 'account'
      return activeAccountKey === accountKey
    }
  },

  emits: ['edit']
})

export default AccountListItem
</script>
