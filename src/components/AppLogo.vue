<template>
  <div class="inline-flex flex-row items-end">
    <img alt="Radix DLT Logo" src="../assets/logo.svg" class="w-30 mr-3">
    <div v-if="lowercaseNetwork" class="bg-rGrayMed px-1.5 py-px text-xxs text-rGray rounded font-bold capitalize -mb-px">{{ lowercaseNetwork }}</div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
export default defineComponent({
  setup () {
    const router = useRouter()
    const { activeNetwork } = useWallet(router)

    const lowercaseNetwork: ComputedRef<string | undefined> = computed(() => activeNetwork.value?.toLowerCase())

    return {
      lowercaseNetwork
    }
  }
})
</script>
