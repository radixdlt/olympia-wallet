import { AccountAddressT, HRP, Network, ValidatorAddressT, TokenBalance } from '@radixdlt/application'

export const formatWalletAddressForDisplay = function (address: AccountAddressT): string {
  const s = address.toString()
  return s.substring(0, 3) + '...' + s.substring(s.length - 9)
}

export const formatValidatorAddressForDisplay = function (address: ValidatorAddressT): string {
  const s = address.toString()
  return s.substring(0, 2) + '...' + s.substring(s.length - 9)
}

export const truncateRRIStringForDisplay = function (rriString: string): any {
  const arrOfValues = []
  for (const [key, val] of Object.entries(HRP)) {
    arrOfValues.push(val.RRI_suffix)
  }

  // Sort by largest -> Smallest since some suffixes have length 3 and some have 2
  // Avoiding scenarios such as matching '_tr' first when there is a '_tr3'
  arrOfValues.sort(function (a, b) {
    return b.length - a.length
  })

  const correctSuffix = arrOfValues.filter((suffix) => {
    return rriString.match(suffix)! != null
  })

  const charsUntilSuffixEnd = correctSuffix.map((suffix) => {
    return rriString.match(suffix)!.index // suffix.length // + matchDetails[1]
  })

  const prefixLength = charsUntilSuffixEnd[0]! + correctSuffix[0].length
  return rriString.substring(0, prefixLength) + '...' + rriString.substring(rriString.length - 9)
}
