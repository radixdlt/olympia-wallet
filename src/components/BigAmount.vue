<template>
  <span>
    {{ asBigNumber }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AmountT } from '@radixdlt/primitives'
import BigNumber from 'bignumber.js'

const BigAmount = defineComponent({
  props: {
    amount: {
      type: Object as PropType<AmountT>,
      required: true
    }
  },

  computed: {
    asBigNumber (): string {
      const baseline = new BigNumber('1000000000000000000e-18')
      const bigNumber = new BigNumber(this.amount.toString({ useLargestDenomination: true }))
      // Return with additional three digit decimal precision
      if (bigNumber.isGreaterThan(baseline) || bigNumber.isZero) return bigNumber.toFormat(3)
      // Return with 3 sig digit decimal precision
      else return bigNumber.precision(3).toFormat()
    }
  }
})

export default BigAmount
</script>
