import { AccountAddressT } from '@radixdlt/application'

export const formatAddressForDisplay = function (address: AccountAddressT) {
  const s = address.toString()
  return s.substring(0, 8) + '...' + s.substring(s.length - 8)
}
