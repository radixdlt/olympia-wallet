import { Network, Radix, HRP, RadixT } from '@radixdlt/application'

type ChosenNetworkT = {
  network: Network
  networkURL: string
  preamble: string
}

let currentNetwork: ChosenNetworkT

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
  currentNetwork = response
  return response
}

export const radixConnection = async (): Promise<RadixT> => {
  const activeNetwork = network(process.env.VUE_APP_NETWORK_NAME as Network)
  const radix = Radix.create()
  await radix.connect(activeNetwork.networkURL)
  return radix
}

export const getCurrentNetwork = () => currentNetwork

export const setNetwork = async (radix: RadixT, name: Network): Promise<RadixT> => {
  await radix.connect(network(name).networkURL)
  return radix
}
