<template>
  <div class="inline-flex flex-row items-end">
    <img alt="Radix DLT Logo" src="../assets/logo.svg" class="w-30 mr-3">
    <div class="bg-rGrayMed px-1.5 py-px text-xxs text-rGray rounded font-bold capitalize -mb-px">{{ lowercaseNetwork }}</div>
  </div>
</template>

<script lang="ts">
import { useRadix } from '@/composables'
import { computed, ComputedRef, defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const { network } = useRadix()

    const lowercaseNetwork: ComputedRef<string> = computed(() => network.value.toLowerCase())

    return {
      lowercaseNetwork
    }
  }
})
</script>
