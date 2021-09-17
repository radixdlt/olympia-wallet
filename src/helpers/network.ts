import { Network, HRP } from '@radixdlt/application'

export type ChosenNetworkT = {
  network: Network
  networkURL: string
  preamble: string
}

export const network = (networkName: Network): ChosenNetworkT => {
  let response: ChosenNetworkT
  if (networkName === 'STOKENET') {
    response = {
      network: Network.STOKENET,
      networkURL: 'https://stokenet.radixdlt.com',
      preamble: HRP.STOKENET.account
    }
  } else if (networkName === 'MAINNET') {
    response = {
      network: Network.MAINNET,
      networkURL: 'https://mainnet.radixdlt.com',
      preamble: HRP.MAINNET.account
    }
  } else {
    throw new Error(`Invalid Network Name ${networkName} Provided`)
  }
  return response
}

export const defaultNetworks: ChosenNetworkT[] = [
  {
    network: Network.MAINNET,
    networkURL: 'https://mainnet.radixdlt.com',
    preamble: HRP.MAINNET.account
  },
  {
    network: Network.STOKENET,
    networkURL: 'https://stokenet.radixdlt.com',
    preamble: HRP.STOKENET.account
  }
]

export const isDefaultNetwork = (network: ChosenNetworkT): boolean => {
  return !!defaultNetworks.find((n: ChosenNetworkT) => n.networkURL === network.networkURL)
}
