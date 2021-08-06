import { Network, Radix, HRP, RadixT } from '@radixdlt/application'

type ChosenNetworkT = {
  network: Network
  networkURL: string
  preamble: string
}

let currentNetwork: ChosenNetworkT

export const network = (networkName: 'stokenet' | 'mainnet'): ChosenNetworkT => {
  let response: ChosenNetworkT
  if (networkName === 'stokenet') {
    response = {
      network: Network.STOKENET,
      networkURL: 'https://stokenet.radixdlt.com',
      preamble: HRP.STOKENET.account
    }
  } else if (networkName === 'mainnet') {
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

const radix = Radix.create()

export const radixConnection = () => radix

export const getCurrentNetwork = () => currentNetwork

export const setNetwork = async (name: 'stokenet' | 'mainnet') => {
  await radix.connect(network(name).networkURL)
  return radix
}

setNetwork(process.env.VUE_APP_NETWORK_NAME)
