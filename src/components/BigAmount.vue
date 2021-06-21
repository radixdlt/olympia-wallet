<template>
  <span
    @mouseover="setHover(true)"
    @mouseleave="setHover(false)"
  >
    {{ asBigNumber }}
  </span>
  <span v-if="hover">{{ asBigNumber }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AmountT } from '@radixdlt/application'
import BigNumber from 'bignumber.js'

BigNumber.set({
  ROUNDING_MODE: BigNumber.ROUND_FLOOR,
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

const formattBigNumber = (x: BigNumber, showFull = false, format: BigNumber.Format = numberFormatUSA) => {
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
  var internallyFormatted = '0'
  var decimalPlaces

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

export const asBigNumber = (amount: AmountT, showFull = false) => {
  const bigNumber = new BigNumber(amount.toString())
  const shiftedAmount = bigNumber.shiftedBy(-18) // Atto

  return formattBigNumber(shiftedAmount, showFull)
}

const BigAmount = defineComponent({
  props: {
    amount: {
      type: Object as PropType<AmountT>,
      required: true
    },
    hover: {
      type: Boolean,
      required: true,
      default: false
    },
  
  },


  methods: {
    setHover (value: Boolean) {
       this.hover = value
    }
  },


  computed: {
    asBigNumber (showFull = false): string {
      return asBigNumber(this.amount, showFull)
    }
  }
})

export default BigAmount
</script>
