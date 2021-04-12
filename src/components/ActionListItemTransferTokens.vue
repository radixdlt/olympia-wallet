<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 items-center">
      <div v-if="isRecipient" class="flex flex-row items-center w-24">
        <img src="@/assets/receiveTokens.svg" alt="receive tokens" />
        <span class="ml-2 text-sm">{{ $t('history.receivedAction') }}</span>
      </div>
      <div v-else class="flex flex-row items-center w-24">
        <img src="@/assets/sendTokens.svg" alt="send tokens" />
        <span class="ml-2 text-sm">{{ $t('history.sentAction') }}</span>
      </div>
      <div><span class="text-rBlack">{{ action.amount.toString() }}</span> XRD</div>
    </div>
    <div v-if="index === 0" class="flex flex-col items-end">
      <div class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.toLabel') }}:</span> <span class="ml-2 w-32 truncate min-w-0">{{ action.to.toString() }}</span>
        <click-to-copy :text="action.to.toString()" />
      </div>
      <div class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.fromLabel') }}:</span> <span class="ml-2 w-32 truncate min-w-0">{{ action.from.toString() }}</span>
        <click-to-copy :text="action.from.toString()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransferTokensAction } from '@radixdlt/application'
import { AddressT } from '@radixdlt/account'
import ClickToCopy from '@/components/ClickToCopy.vue'

const ActionListItemTransferTokens = defineComponent({
  components: {
    ClickToCopy
  },

  props: {
    action: {
      type: Object as PropType<ExecutedTransferTokensAction>,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  computed: {
    isRecipient (): boolean {
      if (!this.activeAddress) return false
      return this.action.to.toString() === this.activeAddress.toString()
    }
  }
})

export default ActionListItemTransferTokens
</script>
