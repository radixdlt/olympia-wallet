import { Radix } from '@radixdlt/application'
import { Ref, ref, computed, ComputedRef } from 'vue'

const appErrors: Ref<Error[]> = ref([])

export const apiErrors = [
  'NetworkNotSupportedError',
  'InvalidTokenRRIError',
  'InvalidAccountAddressError',
  'InvalidValidatorAddressError',
  'NotEnoughNativeTokensForFeesError',
  'NotEnoughTokensForTransferError',
  'NotEnoughTokensForStakeError',
  'NotEnoughTokensForUnstakeError',
  'BelowMinimumStakeError',
  'CannotStakeError',
  'MessageTooLongError'
]

interface useErrorsInterface {
  readonly appErrors: ComputedRef<Error[]>;
  clearLatestError: () => void;
  setError: (error: Error) => void;
  isApiError: (type: string) => boolean;
}

const setError = (error: Error) => {
  appErrors.value = [...appErrors.value, error]
}

const clearLatestError = () => {
  const latestErrors = appErrors.value
  latestErrors.pop()
  appErrors.value = latestErrors
}

const isApiError = (type: string) => {
  return apiErrors.includes(type)
}

export default function useErrors (radix: ReturnType<typeof Radix.create>): useErrorsInterface {
  // radix.errors
  //   .subscribe((error: ErrorT<'wallet'>) => {
  //     console.log('error sink:', error)
  //   })

  return {
    appErrors: computed(() => appErrors.value),
    clearLatestError,
    setError,
    isApiError
  }
}
