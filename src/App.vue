<template>
  <div class="relative bg-gradient-to-r from-rBlue via-blueMid to-blueEnd min-h-screen overflow-hidden font-sans antialiased">
    <div class="bg-rBlue w-1/2 h-tallest origin-center transform rotate-45 absolute z-0 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="relative z-10 min-h-screen">
      <ErrorModalGeneric
        v-if="latestError"
        :error="latestError"
        :errorsCount="errorsCount"
      />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from './composables'
import ErrorModalGeneric from '@/components/ErrorModalGeneric.vue'
import { ErrorT } from '@radixdlt/application'

const App = defineComponent({
  components: {
    ErrorModalGeneric
  },

  setup () {
    const router = useRouter()
    const { appErrors } = useWallet(router)

    const latestError: ComputedRef<ErrorT<'wallet'> | null> = computed(() => {
      return appErrors.value[appErrors.value.length - 1]
    })
    const errorsCount: ComputedRef<number> = computed(() => appErrors.value.length)

    return {
      appErrors,
      errorsCount,
      latestError
    }
  }
})

export default App
</script>
