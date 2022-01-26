import { AccountAddressT, HRP, ValidatorAddressT } from '@radixdlt/application'

export const formatWalletAddressForDisplay = function (address: AccountAddressT): string {
  const s = address.toString()
  return s.substring(0, 3) + '...' + s.substring(s.length - 9)
}

export const formatValidatorAddressForDisplay = function (address: ValidatorAddressT): string {
  const s = address.toString()
  return s.substring(0, 2) + '...' + s.substring(s.length - 9)
}

export const truncateRRIStringForDisplay = function (rriString: string): string {
  // Sort by largest -> Smallest since some suffixes have length 4 and some have 3
  // Avoiding scenarios such as matching '_tr' first when there is a '_tr3'
  // If no RRI suffix match, will return regular string
  // Return original RRI String if <= 21, following Wireframe design examples
  if (rriString.length <= 21) {
    return rriString
  }
  const sortedHRPKeys = getSortedHRPKeys()
  const correctRRISuffix = getCorrectRRISuffixFromHRP(sortedHRPKeys, rriString)
  // Catch in case no RRI Suffix was found in Networks/HRP
  if (correctRRISuffix === '') {
    return rriString
  }
  const prefixLength = getRRIPrefixLength(correctRRISuffix, rriString)
  return rriString.substring(0, prefixLength) + '...' + rriString.substring(rriString.length - 9)
}

export const parseUnderscoresToSpaces = function (message: string): string {
  return message.replaceAll('_', ' ')
}

const getSortedHRPKeys = function (): string[] {
  const allHRPKeys = []
  for (const [key, val] of Object.entries(HRP)) {
    allHRPKeys.push(val.RRI_suffix)
  }
  allHRPKeys.sort(function (a, b) {
    return b.length - a.length
  })
  return allHRPKeys
}

const getCorrectRRISuffixFromHRP = function (hrpKeys: string[], rriString: string): string {
  // Using regex /${suffix}/.exec(rriString) to return the right suffix
  const rriStringMatchHRPKey = hrpKeys.filter((suffix) => {
    return rriString.match(suffix)! != null
  })
  return rriStringMatchHRPKey[0]
}

const getRRIPrefixLength = function (rriSuffix: string, rriString: string): number {
  const match = rriString.match(rriSuffix)!
  return match.index! + rriSuffix.length
}
