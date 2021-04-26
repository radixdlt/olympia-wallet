<template>
  <span>
    {{ asBigNumber }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AmountT } from '@radixdlt/primitives'
import BigNumber from 'bignumber.js'

export const asBigNumber = (amount: AmountT) => {
  const baseline = new BigNumber('0000000000000000001e-18')
  const bigNumber = new BigNumber(amount.toString())
  return bigNumber.multipliedBy(baseline).precision(3).toFormat()
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
