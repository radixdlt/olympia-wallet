import { ErrorT, Radix } from '@radixdlt/application'
import { Ref, ref, computed, ComputedRef } from 'vue'

export type TransactionStateT = 'HW-SIGNING' | 'BUILDING' | 'CONFIRM' | 'SUBMITTING'

export type ClientAppErrorTypeT = 'GENERIC' | 'TRANSACTION-HW-SIGNING' | 'TRANSACTION-BUILDING' | 'TRANSACTION-CONFIRM' | 'TRANSACTION-SUBMITTING'
export type ClientAppErrorT = {
  type: ClientAppErrorTypeT,
  error?: ErrorT<'wallet'> | Error
}

const appErrors: Ref<ClientAppErrorT[]> = ref([])

interface useErrorsInterface {
  readonly appErrors: ComputedRef<ClientAppErrorT[]>;
  clearLatestError: () => void;
  setError: (error: ClientAppErrorT) => void;
}

const setError = (error: ClientAppErrorT) => {
  appErrors.value = [...appErrors.value, error]
}

const clearLatestError = () => {
  const latestErrors = appErrors.value
  latestErrors.pop()
  appErrors.value = latestErrors
}

export default function useErrors (radix: ReturnType<typeof Radix.create>): useErrorsInterface {
  radix.errors
    .subscribe((error: ErrorT<'wallet'>) => {
      console.log('error sink:', error)
    })

  return {
    appErrors: computed(() => appErrors.value),
    clearLatestError,
    setError
  }
}
