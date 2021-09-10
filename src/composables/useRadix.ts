import { ref, computed, ComputedRef } from 'vue'
import { Network, Radix, RadixT, HRP } from '@radixdlt/application'
import { network, ChosenNetworkT } from '@/helpers/network'
import { firstValueFrom } from 'rxjs'

let radix: RadixT = Radix.create()

const envNetworkName: string = process.env.VUE_APP_NETWORK_NAME || 'STOKENET'
const typedNetwork = envNetworkName as Network

const switching = ref(false)
const connected = ref(false)
const activeNetwork = ref(typedNetwork)

interface useRadixInterface {
  connected: ComputedRef<boolean>;
  switching: ComputedRef<boolean>;
  radix: RadixT;
  network: ComputedRef<Network>;
  reset: () => void;
  setNetwork: (network: Network) => void;
  setSwitching: (value: boolean) => void;
  establishConnection: () => Promise<void>;
  updateConnection: (n: string) => Promise<void>;
  networkPreamble: ComputedRef<string>;
}

export default function useRadix (): useRadixInterface {
  return {
    connected: computed(() => connected.value),
    switching: computed(() => switching.value),
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

    async updateConnection (url: string): Promise<void> {
      await radix.connect(url)
      const network = await firstValueFrom(radix.ledger.networkId())
      activeNetwork.value = network
    },

    setNetwork (network: Network) {
      activeNetwork.value = network
    },

    setSwitching (value: boolean) {
      switching.value = value
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
