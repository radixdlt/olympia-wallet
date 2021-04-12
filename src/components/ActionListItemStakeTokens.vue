<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 min-w-0">
      <div class="flex flex-row items-center w-24">
        <img src="@/assets/stakeTokens.svg" alt="receive tokens" />
        <span class="ml-2 text-sm">{{ $t('history.stakeAction') }}</span>
      </div>
      <div><span class="text-rBlack">{{ action.amount.toString() }}</span> XRD</div>
    </div>
    <div v-if="index === 0" class="flex flex-row min-w-0 text-right items-center">
      {{ $t('history.validatorLabel') }}: <span class="ml-2 w-32 truncate">{{ action.validator.toString() }}</span>
      <click-to-copy :text="action.validator.toString()" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedStakeTokensAction } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'

const ActionListItemStakeTokens = defineComponent({
  components: {
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
    }
  }
})

export default ActionListItemStakeTokens
</script>
