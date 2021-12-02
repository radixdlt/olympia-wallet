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
    // Save a list of custom tokens that the user has hidden
    if (!store.get('hiddenTokens')) store.set('hiddenTokens', [])
  }
}

export default migrations
