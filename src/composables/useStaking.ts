import { ref, computed, ComputedRef, Ref } from 'vue'
import { RadixT, StakePositions, UnstakePositions, Validators, ValidatorsEndpoint } from '@radixdlt/application'

interface useStakingInterface {
  readonly activeForm: ComputedRef<'STAKING'|'UNSTAKING'>;
  readonly activeStakes: Ref<StakePositions | null>;
  readonly activeUnstakes: Ref<UnstakePositions | null>;
  readonly loadingAnyStaking: ComputedRef<boolean>;
  readonly validators: ComputedRef<Validators | null>;
  setActiveForm: (form: 'STAKING'|'UNSTAKING') => void;
  stakingUnsub: () => void;
}

const activeForm: Ref<'STAKING'|'UNSTAKING'> = ref('STAKING')
const validators: Ref<Validators | null> = ref(null)
const loadingValidators: Ref<boolean> = ref(true)

export default function useStaking (radix: RadixT): useStakingInterface {
  const activeStakes: Ref<StakePositions | null> = ref(null)
  const activeUnstakes: Ref<UnstakePositions | null> = ref(null)
  const loadingStakes: Ref<boolean> = ref(true)
  const loadingUnstakes: Ref<boolean> = ref(true)

  const activeStakesSub = radix.stakingPositions.subscribe((stakes: StakePositions) => {
    activeStakes.value = stakes
    loadingStakes.value = false
  })
  const activeUnstakesSub = radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => {
    activeUnstakes.value = unstakes
    loadingUnstakes.value = false
  })
  const validatorSub = radix.ledger.validators({ size: 100 }).subscribe((validatorsRes: any) => {
    validators.value = validatorsRes
    loadingValidators.value = false
  })

  return {
    activeForm: computed(() => activeForm.value),
    activeStakes,
    activeUnstakes,
    loadingAnyStaking: computed(() => loadingStakes.value || loadingUnstakes.value || loadingValidators.value),
    validators: computed(() => validators.value),

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
