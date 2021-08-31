import { ref, computed, ComputedRef } from 'vue'
import { Network, Radix, RadixT, HRP } from '@radixdlt/application'
import { network, ChosenNetworkT } from '@/helpers/network'

let radix: RadixT = Radix.create()

const envNetworkName: string = process.env.VUE_APP_NETWORK_NAME || 'STOKENET'
const typedNetwork = envNetworkName as Network

const connected = ref(false)
const activeNetwork = ref(typedNetwork)

interface useRadixInterface {
  connected: ComputedRef<boolean>;
  radix: RadixT;
  network: ComputedRef<Network>;
  reset: () => void;
  establishConnection: () => Promise<void>;
  updateConnection: (n: ChosenNetworkT) => Promise<void>;
  networkPreamble: ComputedRef<string>;
}

export default function useRadix (): useRadixInterface {
  return {
    connected: computed(() => connected.value),
    radix,
    network: computed(() => activeNetwork.value),

    reset: () => {
      radix.__reset()
    },

    async establishConnection (): Promise<void> {
      const selectedNetwork: ChosenNetworkT = network(activeNetwork.value)
      activeNetwork.value = selectedNetwork.network
      if (!radix) {
        radix = Radix.create()
      }
      const result = await radix.connect(selectedNetwork.networkURL)
      connected.value = true
      return result
    },

    async updateConnection (node: ChosenNetworkT): Promise<void> {
      await radix.connect(node.networkURL)
      activeNetwork.value = node.network
    },

    networkPreamble: computed(() => {
      switch (activeNetwork.value) {
        case Network.STOKENET:
          return HRP.STOKENET.account
        case HRP.MAINNET.account:
          return HRP.MAINNET.account
        default:
          return ''
      }
    })
  }
}
