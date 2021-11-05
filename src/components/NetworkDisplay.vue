<template>
  <div class="bg-gradient-to-r from-rBlue to-rBlueDark w-60 mt-3">
    <div class="flex items-center px-5 pb-1 pt-3 text-white text-sm">
      <p> <span class="opacity-80">
      Version: </span> {{ versionNumber }} </p>
    </div>

    <p v-if="lowercaseNetwork" class="text-white text-sm pb-3 pt-1 px-5"> <span
    class="opacity-80"> Network: </span> {{ lowercaseNetwork }} </p>

    <p v-else class="text-white text-sm pb-3 pt-1 px-5"> <span
    class="opacity-80"> Network: </span> Disconnected </p>

  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, Ref, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import { getVersionNumber } from '@/actions/vue/general'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { activeNetwork } = useWallet(router)

    const lowercaseNetwork: ComputedRef<string | undefined> = computed(() =>
    activeNetwork.value?.toUpperCase())

    const versionNumber: Ref<string> = ref('')
    getVersionNumber().then((res) => { versionNumber.value = res })

    return {
      lowercaseNetwork,
      versionNumber
    }
  }
})
</script>
