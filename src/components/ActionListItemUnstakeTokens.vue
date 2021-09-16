<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 min-w-0">
      <div class="flex flex-row items-center w-36 mr-1">
        <img src="@/assets/unstakeTokens.svg" alt="receive tokens" />
        <span class="ml-2 text-sm">{{ $t('history.unstakeAction') }}</span>
      </div>
      <div v-if="action.amount && nativeToken"><big-amount :amount="action.amount" class="text-rBlack text-base"/> {{ nativeToken.symbol.toUpperCase() }}</div>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex flex-row flex-1 min-w-0 items-center">
        <span>{{ $t('history.validatorLabel') }}:</span> <span class="ml-2 mr-1 min-w-0 font-mono">{{ displayAddress }}</span>
        <click-to-copy :address="action.validator.toString()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedUnstakeTokensAction, Token } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatValidatorAddressForDisplay } from '@/helpers/formatter'
import BigAmount from '@/components/BigAmount.vue'

const ActionListItemUnstakeTokens = defineComponent({
  components: {
    BigAmount,
    ClickToCopy
  },

  props: {
    action: {
      type: Object as PropType<ExecutedUnstakeTokensAction>,
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

export default ActionListItemUnstakeTokens
</script>
