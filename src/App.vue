<template>
  <div class="relative bg-gradient-to-r from-rBlue via-blueMid to-blueEnd min-h-screen overflow-hidden font-sans antialiased select-none">
    <div class="bg-rBlue w-1/2 h-tallest origin-center transform rotate-45 absolute z-0 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="relative z-10 min-h-screen">
      <template v-if="latestError">
        <ErrorModalApi
          v-if="isApiError"
          :error="latestError.error"
          :errorsCount="errorsCount"
        />
        <ErrorModalHardware
          v-if="latestError.type === 'HARDWARE'"
          :error="latestError.error"
          :errorsCount="errorsCount"
        />
        <ErrorModalTransactionBuilding
          v-else-if="latestError.type === 'TRANSACTION-BUILDING'"
          :error="latestError.error"
          :errorsCount="errorsCount"
        />
        <ErrorModalTransactionConfirming
          v-else-if="latestError.type === 'TRANSACTION-CONFIRM'"
          :error="latestError.error"
          :errorsCount="errorsCount"
        />
        <ErrorModalGeneric
          v-else
          :error="latestError.error"
          :errorsCount="errorsCount"
        />
      </template>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet, useErrors } from './composables'
import ErrorModalGeneric from '@/components/ErrorModalGeneric.vue'
import ErrorModalHardware from '@/components/ErrorModalHardware.vue'
import ErrorModalApi from '@/components/ErrorModalApi.vue'
import ErrorModalTransactionBuilding from '@/components/ErrorModalTransactionBuilding.vue'
import ErrorModalTransactionConfirming from '@/components/ErrorModalTransactionConfirming.vue'

const App = defineComponent({
  components: {
    ErrorModalGeneric,
    ErrorModalHardware,
    ErrorModalTransactionBuilding,
    ErrorModalTransactionConfirming,
    ErrorModalApi
  },

  setup () {
    const router = useRouter()
    const { radix } = useWallet(router)
    const { appErrors } = useErrors(radix)

    const latestError: ComputedRef<Error | null> = computed(() => {
      return appErrors.value[appErrors.value.length - 1]
    })
    const isApiError: ComputedRef<boolean> = computed(() => {
      const latest: any = appErrors.value[appErrors.value.length - 1]
      if (latest === null) return false
      return latest.type === 'api'
    })

    const errorsCount: ComputedRef<number> = computed(() => appErrors.value.length)

    return {
      appErrors,
      errorsCount,
      latestError,
      isApiError
    }
  }
})

export default App
</script>
