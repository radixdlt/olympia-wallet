<template>
  <div class="relative">
    <wallet-sidebar-default />
    <transition
      enter-active-class="transition ease-out duration-100 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-75 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <wallet-sidebar-accounts v-if="open" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WalletSidebarAccounts from './WalletSidebarAccounts.vue'
import WalletSidebarDefault from './WalletSidebarDefault.vue'
import { useSidebar } from '@/composables'

const WalletSidebar = defineComponent({
  components: {
    WalletSidebarAccounts,
    WalletSidebarDefault
  },

  setup () {
    const { open } = useSidebar()

    return {
      open
    }
  }
})

export default WalletSidebar
</script>
