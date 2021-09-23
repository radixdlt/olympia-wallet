import { Network, Radix, RadixT } from '@radixdlt/application'
import { Subscription } from 'rxjs'
import { timeout } from 'rxjs/operators'
import { computed, ComputedRef, ref, Ref } from 'vue'

interface useConnectableRadixInterface {
  readonly connected: ComputedRef<boolean>;
  readonly loading: ComputedRef<boolean>;
  readonly networkId: ComputedRef<Network | null>;
  testConnection: (url: string) => void;
  cleanupSubscriptions: () => void;
}

export default function useConnectableRadix (): useConnectableRadixInterface {
  const isConnected: Ref<boolean> = ref(false)
  const isLoading: Ref<boolean> = ref(true)
  const network: Ref<Network | null> = ref(null)
  const subs = new Subscription()

  return {
    connected: computed(() => isConnected.value),
    loading: computed(() => isLoading.value),
    networkId: computed(() => network.value),

    testConnection: (networkURL: string) => {
      const tempRadix: RadixT = Radix.create()
      isLoading.value = true
      isConnected.value = false

      subs.add(
        tempRadix.ledger.networkId().pipe(timeout(5000)).subscribe({
          next: (n: Network) => {
            isConnected.value = true
            isLoading.value = false
            network.value = n
          },
          error: () => {
            isConnected.value = false
            isLoading.value = false
          }
        })
      )

      tempRadix.connect(networkURL)
    },

    cleanupSubscriptions: () => { subs.unsubscribe() }
  }
}
