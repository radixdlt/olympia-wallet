<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 min-w-0">
      <div class="flex flex-row items-center w-24">
        <span class="pl-0.5 ml-8 text-sm">{{ $t('history.otherAction') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedStakeTokensAction } from '@radixdlt/application'

const ActionListItemOther = defineComponent({
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

export default ActionListItemOther
</script>
