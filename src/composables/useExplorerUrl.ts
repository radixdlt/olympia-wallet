import { RadixT, Network } from '@radixdlt/application'
import { ref, Ref, ComputedRef, computed } from 'vue'

interface useExplorerUrlInterface {
  readonly explorerUrlBase: ComputedRef<string>;
  explorerUrlUnsub: () => void;
}

export default function useExplorerUrl (radix: RadixT): useExplorerUrlInterface {
  const explorerUrlBase: Ref<string> = ref('')

  const explorerUrlSub = radix.ledger.networkId().subscribe((n: Network) => {
    if (n === 'MAINNET') explorerUrlBase.value = 'https://explorer.radixdlt.com/'
    else explorerUrlBase.value = 'https://stokenet-explorer.radixdlt.com/'
  })

  return {
    explorerUrlBase: computed(() => explorerUrlBase.value),
    explorerUrlUnsub: () => {
      explorerUrlSub.unsubscribe()
    }
  }
}
