import { Network, HRP } from '@radixdlt/application'

export type ChosenNetworkT = {
  network: Network
  networkURL: string
  preamble: string
}

export const network = (networkName: Network): ChosenNetworkT => {
  let response: ChosenNetworkT
  if (networkName === Network.STOKENET) {
    response = {
      network: Network.STOKENET,
      networkURL: 'https://stokenet-gateway.radixdlt.com',
      preamble: HRP[Network.STOKENET].account
    }
  } else if (networkName === Network.MAINNET) {
    response = {
      network: Network.MAINNET,
      networkURL: 'https://mainnet-gateway.radixdlt.com',
      preamble: HRP[Network.MAINNET].account
    }
  } else {
    throw new Error(`Invalid Network Name ${networkName} Provided`)
  }
  return response
}

export const defaultNetwork = 'https://stokenet-gateway.radixdlt.com'

export const defaultNetworks: ChosenNetworkT[] = [
  {
    network: Network.MAINNET,
    networkURL: 'https://mainnet-gateway.radixdlt.com',
    preamble: HRP[Network.MAINNET].account
  },
  {
    network: Network.STOKENET,
    networkURL: 'https://stokenet-gateway.radixdlt.com',
    preamble: HRP[Network.STOKENET].account
  }
]

export const isDefaultNetwork = (network: ChosenNetworkT): boolean => {
  return !!defaultNetworks.find((n: ChosenNetworkT) => n.networkURL === network.networkURL)
}
