import { Network, Radix, HRP, RadixT } from '@radixdlt/application'

type ChosenNetworkT = {
  network: Network
  networkURL: string
  preamble: string
}

export const network = (): ChosenNetworkT => {
  let response: ChosenNetworkT
  const networkName = process.env.VUE_APP_NETWORK_NAME
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
    throw new Error('Invalid Network Name Provided')
  }
  return response
}

export const radixConnection = async (): Promise<RadixT> => {
  const activeNetwork = network()
  const radix = Radix.create()
  await radix.connect(activeNetwork.networkURL)
  return radix
}
