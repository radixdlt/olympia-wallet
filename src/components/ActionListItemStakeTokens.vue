<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 min-w-0">
      <div class="flex flex-row items-center w-24">
        <img src="@/assets/stakeTokens.svg" alt="receive tokens" />
        <span class="ml-2 text-sm">{{ $t('history.stakeAction') }}</span>
      </div>
      <div><span class="text-rBlack">{{ action.amount.toString() }}</span> XRD</div>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.validatorLabel') }}:</span> <span class="ml-2 mr-1 min-w-0">{{ displayAddress(action.validator) }}</span>
        <click-to-copy :text="action.validator.toString()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedStakeTokensAction } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatAddressForDisplay } from '@/helpers/formatter'
import { AddressT } from '@radixdlt/account'

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
  },

  methods: {
    displayAddress (address: AddressT): string {
      return formatAddressForDisplay(address)
    }
  }
})

export default ActionListItemStakeTokens
</script>
