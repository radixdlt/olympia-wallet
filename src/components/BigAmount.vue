<template>
  <span v-if="amount">
    {{ asBigNumber }}
  </span>
  <span v-else>
    0.000
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
      const bigNumber = new BigNumber(this.amount.toString().replace(' ', ''))
      // Return with 3 dig digit decimal precision
      if (bigNumber.isLessThan(baseline)) return bigNumber.precision(3).toFormat()
      // Return with additional three digit decimal precision
      else return bigNumber.toFormat(3)
    }
  }
})

export default BigAmount
</script>
