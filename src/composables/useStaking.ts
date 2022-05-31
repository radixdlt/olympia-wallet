import { ref, computed, Ref, ComputedRef } from 'vue'
import { AccountAddressT, Amount, Network, Radix, Validator, ValidatorAddressT, Validators } from '@radixdlt/application'
import { mergeMap } from 'rxjs/operators'
import { firstValueFrom } from 'rxjs'
import { StakePositionsEndpoint, UnstakePositionsEndpoint } from '@radixdlt/application/dist/api/open-api/_types'

const activeForm: Ref<'STAKING'|'UNSTAKING'> = ref('STAKING')
const validators: Ref<Validators | null> = ref(null)
const loadingValidators: Ref<boolean> = ref(true)

const activeStakes: Ref<StakePositionsEndpoint.DecodedResponse | null> = ref(null)
const activeUnstakes: Ref<UnstakePositionsEndpoint.DecodedResponse | null> = ref(null)
const loadingStakes: Ref<boolean> = ref(true)
const loadingUnstakes: Ref<boolean> = ref(true)

const maybeFetchValidators = async (radix: ReturnType<typeof Radix.create>, network: Network) => {
  if (!loadingValidators.value) return
  const response = await firstValueFrom(radix.ledger.validators(network))
  validators.value = response as Validators
  loadingValidators.value = false
}

const fetchStakesForAddress = async (radix: ReturnType<typeof Radix.create>, address: AccountAddressT) => {
  activeStakes.value = await firstValueFrom(radix.ledger.stakesForAddress(address))
  activeUnstakes.value = await firstValueFrom(radix.ledger.unstakesForAddress(address))
  loadingStakes.value = false
  loadingUnstakes.value = false
}

export default function useStaking (radix: ReturnType<typeof Radix.create>, network: Network) {
  const validatorsTopOneHundred: ComputedRef<Array<Validator>> = computed(() => {
    if (validators.value && validators.value.validators) return validators.value.validators.filter(validator => validator.registered).slice(0, 100)
    return []
  })

  const maybeGetValidator = (validatorAddress: ValidatorAddressT) => {
    if (validators.value && validators.value.validators) {
      return validators.value.validators.find((v) => v.address.equals(validatorAddress)) || null
    }
    return null
  }

  // Return sum of unstakes and pending unstakes for a given validator
  const getUnstakeAmountForValidator = (validatorAddress: ValidatorAddressT) => {
    if (!activeUnstakes.value || !activeUnstakes.value.unstakes) return Amount.fromUnsafe(0)._unsafeUnwrap()
    const unstakesTotal = activeUnstakes.value.unstakes
      .filter((unstake) => unstake.validator.equals(validatorAddress))
      .reduce((accum, unstake) => accum.add(unstake.amount), Amount.fromUnsafe(0)._unsafeUnwrap())
    const pendingUnstakesTotal = activeUnstakes.value.pendingUnstakes
      .filter((unstake) => unstake.validator.equals(validatorAddress))
      .reduce((accum, unstake) => accum.add(unstake.amount), Amount.fromUnsafe(0)._unsafeUnwrap())
    return unstakesTotal.add(pendingUnstakesTotal)
  }

  // Return sum of stakes for a given validator
  const getActiveStakeAmountForValidator = (validatorAddress: ValidatorAddressT) => {
    if (!activeStakes.value || !activeStakes.value.stakes) return Amount.fromUnsafe(0)._unsafeUnwrap()
    return activeStakes.value.stakes
      .filter((stake) => stake.validator.equals(validatorAddress))
      .reduce((accum, stake) => accum.add(stake.amount), Amount.fromUnsafe(0)._unsafeUnwrap())
  }

  // Return sum of pending stakes for a given validator
  const getPendingStakeAmountForValidator = (validatorAddress: ValidatorAddressT) => {
    if (!activeStakes.value || !activeStakes.value.pendingStakes) return Amount.fromUnsafe(0)._unsafeUnwrap()
    return activeStakes.value.pendingStakes
      .filter((stake) => stake.validator.equals(validatorAddress))
      .reduce((accum, stake) => accum.add(stake.amount), Amount.fromUnsafe(0)._unsafeUnwrap())
  }

  return {
    activeForm: computed(() => activeForm.value),
    activeStakes,
    activeUnstakes,
    loadingAnyStaking: computed(() => loadingStakes.value || loadingUnstakes.value || loadingValidators.value),
    validators: computed(() => validators.value),
    validatorsTopOneHundred: computed(() => validatorsTopOneHundred.value),

    fetchValidatorsAndStakes: async (address: AccountAddressT) => {
      await maybeFetchValidators(radix, network)
      await fetchStakesForAddress(radix, address)
    },
    getActiveStakeAmountForValidator,
    getPendingStakeAmountForValidator,
    getUnstakeAmountForValidator,
    maybeGetValidator,
    fetchStakesForAddress,
    setActiveForm: (form: 'STAKING'|'UNSTAKING') => { activeForm.value = form }
  }
}
