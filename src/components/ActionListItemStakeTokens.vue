<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 min-w-0">
      <div class="flex flex-row items-center w-24">
        <img src="@/assets/stakeTokens.svg" alt="receive tokens" />
        <span class="ml-2 text-sm">{{ $t('history.stakeAction') }}</span>
      </div>
      <div><big-amount :amount="action.amount" class="text-rBlack"/> {{ nativeToken.symbol.toUpperCase() }}</div>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.validatorLabel') }}:</span> <span class="ml-2 mr-1 min-w-0 font-mono">{{ displayAddress }}</span>
        <click-to-copy :address="action.validator.toString()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedStakeTokensAction, Token } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatValidatorAddressForDisplay } from '@/helpers/formatter'
import BigAmount from '@/components/BigAmount.vue'

const ActionListItemStakeTokens = defineComponent({
  components: {
    BigAmount,
    ClickToCopy
  },

  props: {
    action: {
      type: Object as PropType<ExecutedStakeTokensAction>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: true
    }
  },

  computed: {
    displayAddress (): string {
      return formatValidatorAddressForDisplay(this.action.validator)
    }
  }
})

export default ActionListItemStakeTokens
</script>
