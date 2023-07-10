type storedHardwareAddress = { address: string; index: number };
type storedHardwareDevice = { name?: string; addresses?: storedHardwareAddress[] }

export const migrateHardwareAccount = (store: Record<string, any>, network: 'mainnet' | 'stokenet') => {
  const existingAddress = store.get(`wallets.${network}.hardwareAddress`)
  if (existingAddress) {
    const primaryDevice: storedHardwareDevice = {
      name: 'Ledger 1',
      addresses: [{ address: existingAddress, index: 0 }]
    }
    store.set(`wallets.${network}.hardwareDevices`, [primaryDevice])
  } else {
    store.set(`wallets.${network}.hardwareDevices`, [])
  }
}
