<template>
  <WalletLayout>
    <router-view />
  </WalletLayout>
 </template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useRouter, onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useWallet } from '@/composables'
import WalletLayout from '@/components/layout/WalletLayout.vue'

const WalletIndex = defineComponent({
  components: {
    WalletLayout
  },

  setup () {
    const router = useRouter()
    const route = useRoute()

    const {
      hasWallet,
      activeNetwork,
      setActiveAddress,
      waitUntilAllLoaded
    } = useWallet(router)

    watch(
      () => route.params.activeAddress,
      (addr, oldAddr) => {
        if (!addr) return
        if (addr === oldAddr) return
        const id = Array.isArray(addr) ? addr[0] : addr
        setActiveAddress(id)
      },
      { immediate: true }
    )

    onBeforeRouteUpdate(async () => {
      await waitUntilAllLoaded()
      return true
    })

    // Return home if wallet is undefined
    if (!hasWallet.value) router.push('/')

    return {
      activeNetwork
    }
  }
})

export default WalletIndex
</script>
