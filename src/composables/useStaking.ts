import { ref, computed, ComputedRef, Ref } from 'vue'
import { RadixT, StakePositions, UnstakePositions } from '@radixdlt/application'

interface useStakingInterface {
  readonly activeStakes: Ref<StakePositions | null>;
  readonly activeUnstakes: Ref<UnstakePositions | null>;
  readonly loadingAllStaking: ComputedRef<boolean>;
  stakingUnsub: () => void;
}

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
    activeStakes,
    activeUnstakes,
    loadingAllStaking: computed(() => loadingStakes.value && loadingUnstakes.value),
    stakingUnsub: () => {
      loadingStakes.value = false
      loadingUnstakes.value = false
      activeStakesSub.unsubscribe()
      activeUnstakesSub.unsubscribe()
    }
  }
}
