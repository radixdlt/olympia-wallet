import { AccountAddressT, ValidatorAddressT } from '@radixdlt/application'

export const formatWalletAddressForDisplay = function (address: AccountAddressT): string {
  const s = address.toString()
  return s.substring(0, 3) + '...' + s.substring(s.length - 9)
}

export const formatValidatorAddressForDisplay = function (address: ValidatorAddressT): string {
  const s = address.toString()
  return s.substring(0, 2) + '...' + s.substring(s.length - 9)
}
