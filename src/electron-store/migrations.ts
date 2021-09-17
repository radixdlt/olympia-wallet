const migrations = {
  '0.0.1': (store: Record<string, any>) => {
    store.set('debugPhase', true);
  },
  '1.1.1': (store: Record<string, any>) => {
    store.delete('debugPhase');

    // Allow users to switch between STOKENET and MAINNET while using the app. Users should have
    // a derivedAccountsIndex and hardwareAddress unique to each network
    store.set('phase', '1.1.1');

    const currentNetwork = process.env.VUE_APP_NETWORK_NAME
    const otherNetwork = process.env.VUE_APP_NETWORK_NAME === 'MAINNET' ? 'STOKENET' : 'MAINNET'
    const derivedAccountsIndex = store.get('derivedAccountsIndex')
    const hardwareAddress = store.get('hardwareAddress')

    // Nest derivedAccountsIndex and hardwareAddress values under current network
    store.set(`wallets.${currentNetwork}.derivedAccountsIndex`, derivedAccountsIndex)
    store.set(`wallets.${currentNetwork}.hardwareAddress`, hardwareAddress)

    // Set other network to have an index of 0
    store.set(`wallets.${otherNetwork}.derivedAccountsIndex`, 0)

    // Remove old configuration
    store.delete('derivedAccountsIndex')
    store.delete('hardwareAddress')
  }
}

export default migrations
