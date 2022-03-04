import { checkLedgerConnection } from '@/actions/vue/hardware-wallet'
import { RadixAPDU } from '@radixdlt/hardware-ledger'
import { computed, ComputedRef, ref, Ref } from 'vue'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

interface useLedgerInterface {
  readonly isConnected: ComputedRef<boolean>;
}

export default function useLedger (): useLedgerInterface {
  const isConnected: Ref<boolean> = ref(false)

  // Send default APDU to ledger library
  // Library will throw errors when ledger is not connected
  // Library will resolve with a response when ledger is connected
  // Expose connection status in ref
  // setInterval(async () => {
  //   try {
  //     const apdu = await RadixAPDU.getVersion()
  //     await checkLedgerConnection(apdu)
  //     isConnected.value = true
  //   } catch (e) {
  //     isConnected.value = false
  //   }
  // }, 500)

  return {
    isConnected: computed(() => isConnected.value)
  }
}
