import { Radix } from '@radixdlt/application'
import { Ref, ref, computed, ComputedRef } from 'vue'
const appErrors: Ref<Error[]> = ref([])

interface useErrorsInterface {
  readonly appErrors: ComputedRef<Error[]>;
  clearLatestError: () => void;
  setError: (error: Error) => void;
  getApiErrorMsg: (type: string) => string;
}

const setError = (error: Error) => {
  appErrors.value = [...appErrors.value, error]
}

const clearLatestError = () => {
  const latestErrors = appErrors.value
  latestErrors.pop()
  appErrors.value = latestErrors
}

export default function useErrors (radix: ReturnType<typeof Radix.create>): useErrorsInterface {
  // radix.errors
  //   .subscribe((error: ErrorT<'wallet'>) => {
  //     console.log('error sink:', error)
  //   })

  return {
    appErrors: computed(() => appErrors.value),
    clearLatestError,
    setError
  }
}
