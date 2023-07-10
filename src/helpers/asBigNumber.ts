import BigNumber from 'bignumber.js'
import { AmountT } from '@radixdlt/application'
import { AmountFormats } from '@/composables/useWallet'

BigNumber.set({
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
  EXPONENTIAL_AT: [-30, 30]
})

const numberFormatUSA = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}

const numberFormatEUROPE = {
  prefix: '',
  decimalSeparator: ',',
  groupSeparator: '.',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}

// internal format used so BigNumber can read in its own output
const internalFormat = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: '',
  groupSize: 0,
  secondaryGroupSize: 0,
  fractionGroupSeparator: '',
  fractionGroupSize: 0,
  suffix: ''
}

export const formattBigNumber = (x: BigNumber, showFull = false, fmtString: AmountFormats): string => {
  /*
  1000000000000 => 1,000,000,000,000
  1000000000000.59 => 1,000,000,000,000.6
  0.987654321 => 0.98765432
  1000.12341234 => 1,000.1234
  1000.50001 => 1,000.5
  999999.09999999999 => 999,999.1
  0.999999995 => 1
  0.00000000499999999 => 0
  0.000000005 => 0.00000001
*/
  const maxPlaces = 8
  const integerPart = x.integerValue(BigNumber.ROUND_FLOOR)
  const decimalPart = x.minus(integerPart)
  const dpLength = decimalPart.toFixed().length - 2
  const ipLength = integerPart.toFixed().length
  let internallyFormatted = '0'
  let decimalPlaces

  const format = fmtString === 'us' ? numberFormatUSA : numberFormatEUROPE

  if (x.isZero()) {
    return '0'
  }

  if (showFull || decimalPart.isZero()) {
  } else if (integerPart.isZero()) {
    if (dpLength > maxPlaces) {
      decimalPlaces = maxPlaces
    }
  } else {
    if (ipLength >= maxPlaces) {
      decimalPlaces = 1
    } else {
      const totalPlaces = dpLength + ipLength
      if (totalPlaces > maxPlaces) {
        decimalPlaces = maxPlaces - ipLength
      }
    }
  }
  if (decimalPlaces === undefined) {
    internallyFormatted = x.toFormat(internalFormat)
  } else {
    internallyFormatted = x.toFormat(decimalPlaces, internalFormat)
  }

  // Rounding may have introduced zeros and a decimal place.
  // Also, to use locale formatting, we use BN again.
  const z = new BigNumber(internallyFormatted)
  return z.toFormat(format)
}

export const asBigNumber = (amount: AmountT, showFull = false, displayFormat: AmountFormats = 'us') : string => {
  const bigNumber = new BigNumber(amount.toString())
  const shiftedAmount = bigNumber.shiftedBy(-18) // Atto

  return formattBigNumber(shiftedAmount, showFull, displayFormat)
}
