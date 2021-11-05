<template>
  <div class="bg-gradient-to-r from-rBlue to-rBlueDark w-60 mt-3">
    <div class="flex items-center px-5 pb-1 pt-3 text-white text-sm">
      <p>
        <span class="opacity-80">{{ $t('wallet.version') }}: </span> {{ versionNumber }}
      </p>
      <p
        v-if="updateAvailable"
        class="ml-2 text-white text-xxs rounded b-solid border border-rGreen px-1 cursor-pointer"
        @click="downloadLatestVersion"
      >
        {{ $t('wallet.update') }}
      </p>
    </div>

    <p v-if="lowercaseNetwork" class="text-white text-sm pb-3 pt-1 px-5">
      <span class="opacity-80"> {{ $t('wallet.network') }}: </span> {{ lowercaseNetwork }}
    </p>

    <p v-else class="text-white text-sm pb-3 pt-1 px-5">
      <span class="opacity-80"> {{ $t('wallet.network') }}: </span> {{$t('wallet.disconnected') }}
    </p>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, Ref, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import { getVersionNumber, downloadLatestVersion, getIsUpdateAvailable } from '@/actions/vue/general'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { activeNetwork } = useWallet(router)

    const lowercaseNetwork: ComputedRef<string | undefined> = computed(() =>
      activeNetwork.value?.toUpperCase()
    )

    const versionNumber: Ref<string> = ref('')
    getVersionNumber().then((res) => { versionNumber.value = res })

    const updateAvailable: Ref<boolean> = ref(false)
    getIsUpdateAvailable().then((res) => { updateAvailable.value = res })

    return {
      lowercaseNetwork,
      updateAvailable,
      versionNumber,
      downloadLatestVersion
    }
  }
})
</script>
