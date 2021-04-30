<template>
  <span>
    {{ asBigNumber }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AmountT } from '@radixdlt/primitives'
import BigNumber from 'bignumber.js'

BigNumber.set({
  ROUNDING_MODE: BigNumber.ROUND_FLOOR,
  EXPONENTIAL_AT: [-30, 30]
})

const formattBigNumber = (x: BigNumber) => {
  /*
  1000000000000.59 => 1,000,000,000,000.5
  1000000000000 => 1,000,000,000,000
  1000.153229521 => 1,000.15322952
  1000.500 => 1,000.5
  0.109351852001 => 0.10935185200
  0.10935185200 => 0.109351852
  */
  const maxPlaces = 12
  const integerPart = x.integerValue()
  const decimalPart = x.minus(integerPart)
  const dpLength = decimalPart.toFixed().length
  const ipLength = integerPart.toFixed().length

  if (decimalPart.isZero()) {
    return x.toFormat()
  } else if (integerPart.isZero()) {
    if (dpLength > maxPlaces) {
      return x.toFormat(maxPlaces)
    }
  } else {
    if (ipLength >= maxPlaces) {
      return x.toFormat(1)
    }
    const totalPlaces = (dpLength - 2) + ipLength
    if (totalPlaces > maxPlaces) {
      return x.toFormat(maxPlaces - ipLength)
    }
  }
  return x.toFormat()
}

export const asBigNumber = (amount: AmountT) => {
  const bigNumber = new BigNumber(amount.toString())
  const shiftedAmount = bigNumber.shiftedBy(-18) // Atto

  return formattBigNumber(shiftedAmount)
}

const BigAmount = defineComponent({
  props: {
    amount: {
      type: Object as PropType<AmountT>,
      required: true
    }
  },

  computed: {
    asBigNumber (): string {
      return asBigNumber(this.amount)
    }
  }
})

export default BigAmount
</script>
