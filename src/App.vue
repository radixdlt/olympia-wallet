<template>
  <div class="relative bg-gradient-to-r from-rBlue via-blueMid to-blueEnd min-h-screen overflow-hidden font-sans antialiased">
    <div class="bg-rBlue w-1/2 h-tallest origin-center transform rotate-45 absolute z-0 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="relative z-10 min-h-screen">
      <template v-if="latestError">
        <ErrorModalGeneric
          v-if="latestError.type === 'GENERIC'"
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
import { useWallet } from './composables'
import ErrorModalGeneric from '@/components/ErrorModalGeneric.vue'
import { ClientAppErrorT } from './composables/useWallet'

const App = defineComponent({
  components: {
    ErrorModalGeneric
  },

  setup () {
    const router = useRouter()
    const { appErrors } = useWallet(router)

    const latestError: ComputedRef<ClientAppErrorT | null> = computed(() => {
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
