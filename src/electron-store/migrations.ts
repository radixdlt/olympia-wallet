import { store } from "@/actions/electron/data-store"

const migrations = {
  '0.0.1': (store: Record<string, any>) => {
    store.set('debugPhase', true)
    if (!store.get('seed')) store.set('seed', '')
    if (!store.get('pin')) store.set('pin', '')
    if (!store.get('account')) store.set('account', {})
    if (!store.get('derivedAccountsIndex')) store.set('derivedAccountsIndex', '0')
    if (!store.get('hardwareAddress')) store.set('hardwareAddress', '')
  },
  '1.1.1': (store: Record<string, any>) => {
    store.delete('debugPhase')
    store.set('selectedNode', '')

    // Allow users to switch between STOKENET and MAINNET while using the app. Users should have
    // a derivedAccountsIndex and hardwareAddress unique to each network
    store.set('phase', '1.1.1')

    const derivedAccountsIndex = store.get('derivedAccountsIndex')
    const hardwareAddress = store.get('hardwareAddress')

    store.set('wallets.MAINNET.derivedAccountsIndex', derivedAccountsIndex)
    store.set('wallets.STOKENET.derivedAccountsIndex', '0')

    if (hardwareAddress) {
      const network = hardwareAddress.startsWith('rdx') ? 'MAINNET' : 'STOKENET'
      store.set(`wallets.${network}.hardwareAddress`, hardwareAddress)
    }

    // Remove old configuration
    store.delete('derivedAccountsIndex')
    store.delete('hardwareAddress')
  },
  '1.3.0': (store: Record<string, any>) => {
    if (!store.get('hiddenTokens')) store.set('hiddenTokens', [])

    if (!store.get('wallets.MAINNET.latestAddress')) store.set('wallets.MAINNET.latestAddress', '')
    if (!store.get('wallets.STOKENET.latestAddress')) store.set('wallets.STOKENET.latestAddress', '')
  },
  '1.3.4': (store: Record<string, any>) => {
    const existingMainnetHardwareAddress = store.get('wallets.mainnet.hardwareAddress')
    if (!store.get('wallets.mainnet.hardwareDevices')) store.set('wallets.mainnet.hardwareDevices', [])

    if (existingMainnetHardwareAddress) {
      const primaryStokenetAccount: any = {}
      primaryStokenetAccount["name"] = existingMainnetHardwareAddress
      primaryStokenetAccount["addresses"] = [{"address": existingMainnetHardwareAddress, "index": 0}]
      store.set(`wallets.mainnet.hardwareDevices`, [primaryStokenetAccount])
    }

    // ------------------------------------------------------------------------------------------------------------
    const existingStokenetHardwareAddress = store.get('wallets.stokenet.hardwareAddress')
    if (!store.get('wallets.stokenet.hardwareDevices')) store.set('wallets.stokenet.hardwareDevices', [])

    if (existingStokenetHardwareAddress) {
      const primaryStokenetAccount: any = {}
      primaryStokenetAccount["name"] = existingStokenetHardwareAddress
      primaryStokenetAccount["addresses"] = [{"address": existingStokenetHardwareAddress, "index": 0}]
      store.set(`wallets.stokenet.hardwareDevices`, [primaryStokenetAccount])
    }
    // --------------------------------------------Hidden Accounts-------------------------------------------------
    if (!store.get('hiddenAccounts')) store.set('hiddenAccounts', [])
    
    if (!store.get('update-downloaded')) store.set('update-downloaded', false)
  }
}

export default migrations
