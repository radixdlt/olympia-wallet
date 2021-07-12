import { AccountAddressT } from '@radixdlt/application'

export const formatAddressForDisplay = function (address: AccountAddressT) {
  const s = address.toString()
  return s.substring(0, 6) + '...' + s.substring(s.length - 6)
}
