import { AccountName, SelectedNode } from '../electron/data-store'
import { AccountAddress, Network, ResourceIdentifierT } from '@radixdlt/application'
import { HardwareAddress, EncodedHardwareAddress, HardwareDevice, EncodedHardwareDevice } from '@/services/_types'
import { resolveComponent } from 'vue'
export const saveAccountName = (accountAddress: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-account-name', JSON.stringify({ accountAddress, prettyName })))
})

export const saveDeviceName = (deviceIndex: number | undefined, network: string, prettyName: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-device-name', JSON.stringify({ network, deviceIndex, prettyName })))
})

export const getLatestAccountAddress = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-latest-account-address', String(network)))
})

export const saveLatestAccountAddress = (address: string, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-latest-account-address', JSON.stringify({ address, network })))
})

export const getAccountNames = (): Promise<AccountName[]> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-account-names'))
})

export const saveDerivedAccountsIndex = (num: number, network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-num-accounts', JSON.stringify({ num, network })))
})

export const saveDerivedHardwareAccountsIndex = (num: number, network: Network, deviceId: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('save-hw-num-accounts', JSON.stringify({ num, network, deviceId })))
})

export const getDerivedAccountsIndex = (network: Network): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-num-accounts', String(network)))
})

export const saveHardwareDevices = async (network: Network, hardwareDevices: HardwareDevice[]) => new Promise((resolve) => {
  const data = hardwareDevices.map((hw: HardwareDevice) => {
    return {
      name: hw.name,
      addresses: hw.addresses.map(({ name, index, address }) => ({ name, index, address: address.toString() }))
    }
  }) as EncodedHardwareDevice[]

  resolve(window.ipcRenderer.invoke('save-hw-devices', JSON.stringify({ network: String(network), encodedDevices: data })))
})

export const getHardwareDevices = async (network: Network): Promise<HardwareDevice[]> => {
  const data = await window.ipcRenderer.invoke('get-hw-devices', String(network)) as EncodedHardwareDevice[]

  return data.map((device: EncodedHardwareDevice) => {
    const addresses = device.addresses.map((addr: EncodedHardwareAddress) => {
      const addressResult = AccountAddress.fromUnsafe(addr.address)
      if (addressResult.isErr()) { throw new Error('Invalid Hardware Address Reference') }
      return { ...addr, address: addressResult.value } as HardwareAddress
    })
    return { ...device, addresses: addresses } as HardwareDevice
  })
}

export const resetStore = (): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('reset-store'))
})

export const persistNodeSelection = (nodeUrl: string, hash: string): Promise<string> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('persist-node-selection', JSON.stringify({ nodeUrl, hash })))
})

export const fetchSelectedNodeFromStore = async (): Promise<SelectedNode> => {
  const data = await window.ipcRenderer.invoke('fetch-selected-node') as SelectedNode
  return data
}

export const persistCustomNodeURL = async (nodeURL: string): Promise<void> => {
  const data = await window.ipcRenderer.invoke('persist-custom-node-url', nodeURL)
  return data
}

export const fetchCustomNodeURLs = async (): Promise<string[]> => {
  const data = await window.ipcRenderer.invoke('fetch-custom-node-urls') as string[]
  return data
}

export const forgetCustomNodeURL = async (nodeURL: string): Promise<void> => {
  await window.ipcRenderer.invoke('forget-custom-node-url', nodeURL)
}

export const hideTokenType = async (tokenRRI: ResourceIdentifierT): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('hide-token-type', tokenRRI.toString())
  return newHiddenTokens
}

export const unhideTokenType = async (tokenRRI: string): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('unhide-token-type', tokenRRI.toString())
  return newHiddenTokens
}

export const getHiddenTokens = async (): Promise<string[]> => {
  const data = await window.ipcRenderer.invoke('get-hidden-tokens')
  return data
}

export const getAcceptedTos = (): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-accepted-tos'))
})

export const setAcceptedTos = (value: boolean): Promise<boolean> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('set-accepted-tos', value))
})

export const getHiddenAccounts = (): Promise<string[]> => new Promise((resolve) => {
  resolve(window.ipcRenderer.invoke('get-hidden-accounts'))
})

export const hideAccount = async (address: string): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('hide-account', address)
  return newHiddenTokens
}

export const unhideAccount = async (address: string): Promise<string[]> => {
  const newHiddenTokens = await window.ipcRenderer.invoke('unhide-account', address)
  return newHiddenTokens
}
