import { AddressT } from '@radixdlt/account'

export const formatAddressForDisplay = function (address: AddressT) {
  const s = address.toString()
  return s.substring(0, 8) + '...' + s.substring(s.length - 8)
}
