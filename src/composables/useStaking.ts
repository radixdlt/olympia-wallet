import { ref, Ref } from 'vue'
import { RadixT, StakePositions, UnstakePositions } from '@radixdlt/application'

interface useStakingInterface {
  readonly activeStakes: Ref<StakePositions | null>;
  readonly activeUnstakes: Ref<UnstakePositions | null>;
  stakingUnsub: () => void;
}

export default function useStaking (radix: RadixT): useStakingInterface {
  const activeStakes: Ref<StakePositions | null> = ref(null)
  const activeUnstakes: Ref<UnstakePositions | null> = ref(null)

  const activeStakesSub = radix.stakingPositions.subscribe((stakes: StakePositions) => { activeStakes.value = stakes })
  const activeUnstakesSub = radix.unstakingPositions.subscribe((unstakes: UnstakePositions) => { activeUnstakes.value = unstakes })

  return {
    activeStakes,
    activeUnstakes,
    stakingUnsub: () => {
      activeStakesSub.unsubscribe()
      activeUnstakesSub.unsubscribe()
    }
  }
}
