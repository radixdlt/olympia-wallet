<template>
  <div>
    <div class="flex flex-row mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-4 text-rGreen">
        <circle cx="12" cy="12" r="11.5" stroke="white" :class="{'fill-current': isActive}" />
        <path d="M16.2423 14.677C15.2852 13.5191 13.8379 12.7812 12.2183 12.7812C9.33632 12.7812 7 15.1175 7 17.9995" stroke="white" stroke-miterlimit="10"/>
        <path d="M17.4366 17.9999C17.4366 17.3287 17.3099 16.687 17.0791 16.0977" stroke="white" stroke-miterlimit="10"/>
        <path d="M12.2181 11.1432C13.6383 11.1432 14.7897 9.99183 14.7897 8.57158C14.7897 7.15133 13.6383 6 12.2181 6C10.7978 6 9.64648 7.15133 9.64648 8.57158C9.64648 9.99183 10.7978 11.1432 12.2181 11.1432Z" :stroke="isActive ? '#FFFFFf': '#00C389'" stroke-miterlimit="10"/>
      </svg>

      <div class="font-medium leading-snug">My first account!</div>
    </div>
    <div class="text-xs text-rGrayMed relative z-20 flex justify-between">
      <span class="mr-2">{{ $t('wallet.addressLabel') }}</span>
      <span class="flex-1 w-full truncate">{{ address.toString() }}</span>
      <click-to-copy :text="address.toString()" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountT, AddressT } from '@radixdlt/account'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'

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
    }
  },

  setup (props) {
    const address = ref(null)
    const subs = new Subscription()

    props.account.deriveAddress().subscribe((a: AddressT) => { address.value = a }).add(subs)
    return { address }
  },

  computed: {
    isActive () {
      const activeAccountKey: string = this.activeAccount ? this.activeAccount.hdPath.toString() : 'active'
      const accountKey: string = this.account ? this.account.hdPath.toString() : 'account'
      return activeAccountKey === accountKey
    }
  }
})

export default AccountListItem
</script>
