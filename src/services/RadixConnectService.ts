import { Network, Radix, HRP } from '@radixdlt/application'
import { network } from '@/helpers/network'

export default class RadixConnectService extends EventTarget {
  private radix: ReturnType<typeof Radix.create> = Radix.create();
  private currentNetworkId: Network = process.env.VUE_APP_NETWORK_NAME as Network;

  async establishConnection (): Promise<void> {
    const activeNetwork = network(process.env.VUE_APP_NETWORK_NAME as Network)
    this.currentNetworkId = activeNetwork.network
    return this.radix.connect(activeNetwork.networkURL)
  }

  connectToNode (networkURL: string, networkId: Network) {
    this.currentNetworkId = networkId
    this.radix.connect(networkURL)
    // Dispatch connect event so UI can update accordingly
    const event = new Event('connect')
    this.dispatchEvent(event)
  }

  getRadixInstance (): ReturnType<typeof Radix.create> {
    return this.radix
  }

  getActiveNetworkId (): Network {
    return this.currentNetworkId
  }

  getNetworkPreamble (): string {
    switch (this.currentNetworkId) {
      case Network.STOKENET:
        return HRP.STOKENET.account
      case HRP.MAINNET.account:
        return HRP.MAINNET.account
      default:
        return ''
    }
  }

  isCurrentNetworkById (id: Network): boolean {
    return this.currentNetworkId === id
  }
}
