import { ref, computed, ComputedRef, Ref } from 'vue'
import { RadixT, StakePositions, UnstakePositions } from '@radixdlt/application'

interface useStakingInterface {
  readonly activeForm: ComputedRef<'STAKING'|'UNSTAKING'>;
  readonly activeStakes: Ref<StakePositions | null>;
  readonly activeUnstakes: Ref<UnstakePositions | null>;
  readonly loadingAllStaking: ComputedRef<boolean>;
  setActiveForm: (form: 'STAKING'|'UNSTAKING') => void;
  stakingUnsub: () => void;
}

const activeForm: Ref<'STAKING'|'UNSTAKING'> = ref('STAKING')

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

  return {
    activeForm: computed(() => activeForm.value),
    activeStakes,
    activeUnstakes,
    loadingAllStaking: computed(() => loadingStakes.value && loadingUnstakes.value),

    setActiveForm: (form: 'STAKING'|'UNSTAKING') => { activeForm.value = form },
    stakingUnsub: () => {
      loadingStakes.value = false
      loadingUnstakes.value = false
      activeStakesSub.unsubscribe()
      activeUnstakesSub.unsubscribe()
    }
  }
}
