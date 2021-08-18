import { ref, computed, ComputedRef } from 'vue'
import { Network, Radix, RadixT } from '@radixdlt/application'
import { network, ChosenNetworkT } from '@/helpers/network'

let radix: RadixT = Radix.create()

const connected = ref(false)
const activeNetwork = ref(Network.MAINNET)

interface useRadixInterface {
  connected: ComputedRef<boolean>;
  radix: RadixT;
  network: ComputedRef<Network>;
  establishConnection: () => Promise<void>
}

export default function useRadix (): useRadixInterface {
  return {
    connected: computed(() => connected.value),
    radix,
    network: computed(() => activeNetwork.value),

    async establishConnection (): Promise<void> {
      const selectedNetwork: ChosenNetworkT = network(activeNetwork.value)
      activeNetwork.value = selectedNetwork.network
      if (!radix) {
        radix = Radix.create()
      }
      const result = await radix.connect(selectedNetwork.networkURL)
      connected.value = true
      return result
    }
  }
}
