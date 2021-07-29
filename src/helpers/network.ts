import { Network, Radix } from '@radixdlt/application'

type ChosenNetworkT = {
  network: Network
  networkURL: string
}

export const network = (): ChosenNetworkT => {
  let response: ChosenNetworkT
  const networkName = process.env.VUE_APP_NETWORK_NAME
  if (networkName === 'stokenet') {
    response = {
      network: Network.STOKENET,
      networkURL: 'https://stokenet.radixdlt.com'
    }
  } else if (networkName === 'mainnet') {
    response = {
      network: Network.MAINNET,
      networkURL: 'https://mainnet.radixdlt.com'
    }
  } else {
    throw new Error('Invalid Network Name Provided')
  }
  return response
}

export const radixConnection = () => {
  const activeNetwork = network()
  return Radix
    .create({ network: activeNetwork.network })
    .connect(activeNetwork.networkURL)
}
