import { ref, computed, Ref, ComputedRef } from 'vue'
import { Amount, Radix, Validator, ValidatorAddressT, Validators } from '@radixdlt/application'
import { mergeMap } from 'rxjs/operators'
import { Observed } from '@/helpers/typeHelpers'

const activeForm: Ref<'STAKING'|'UNSTAKING'> = ref('STAKING')
const validators: Ref<Validators | null> = ref(null)
const loadingValidators: Ref<boolean> = ref(true)

export default function useStaking (radix: ReturnType<typeof Radix.create>) {
  const activeStakes: Ref<Observed<typeof radix.stakingPositions> | null> = ref(null)
  const activeUnstakes: Ref<Observed<typeof radix.unstakingPositions> | null> = ref(null)
  const loadingStakes: Ref<boolean> = ref(true)
  const loadingUnstakes: Ref<boolean> = ref(true)

  const activeStakesSub = radix.stakingPositions.subscribe((stakes) => {
    activeStakes.value = stakes
    loadingStakes.value = false
  })
  const activeUnstakesSub = radix.unstakingPositions.subscribe((unstakes) => {
    activeUnstakes.value = unstakes
    loadingUnstakes.value = false
  })
  const validatorSub = radix.ledger.networkId()
    .pipe(mergeMap((network) => radix.ledger.validators(network)))
    .subscribe((validatorsRes: any) => {
      validators.value = validatorsRes
      loadingValidators.value = false
    })

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

    getActiveStakeAmountForValidator,
    getPendingStakeAmountForValidator,
    getUnstakeAmountForValidator,
    maybeGetValidator,
    setActiveForm: (form: 'STAKING'|'UNSTAKING') => { activeForm.value = form },
    stakingUnsub: () => {
      loadingStakes.value = true
      loadingUnstakes.value = true
      activeStakesSub.unsubscribe()
      activeUnstakesSub.unsubscribe()
      validatorSub.unsubscribe()
    }
  }
}
