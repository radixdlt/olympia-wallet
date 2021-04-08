<template>
  <div class="border border-rGray rounded-md flex flex-row mb-2">
    <div class="bg-rGrayLightest text-rGrayDark text-sm pl-3 w-44 flex items-center">
      {{ sentAt }}
    </div>
    <div class="flex-1">
      <div class="py-3.5 px-3">
        <div v-for="(action, i) in transaction.actions" :key="i">
          <action-list-item-stake-tokens
            v-if="action.type === 'StakeTokens'"
            :action="action"
            :index="i"
          />
          <action-list-item-unstake-tokens
            v-else-if="action.type === 'UnstakeTokens'"
            :action="action"
            :index="i"
          />
          <action-list-item-transfer-tokens
            v-else-if="action.type === 'TokenTransfer'"
            :action="action"
            :index="i"
            :activeAddress="activeAddress"
          />
          <action-list-item-other
            v-else
            :action="action"
            :index="i"
            :activeAddress="activeAddress"
          />
        </div>
      </div>
    </div>
    <div class="bg-rGrayLightest flex items-center justify-center px-3">
      <div class="w-6 h-6 rounded-full border border-rGray flex items-center justify-center cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.66797 3.60449H10.9101V10.8466" stroke="#7A99AC" stroke-miterlimit="10"/>
        <path d="M10.9096 3.60449L3.60449 10.9097" stroke="#7A99AC" stroke-miterlimit="10"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransaction } from '@radixdlt/application'
import { DateObject, DateTime } from 'luxon'
import ActionListItemStakeTokens from '@/components/ActionListItemStakeTokens.vue'
import ActionListItemUnstakeTokens from '@/components/ActionListItemUnstakeTokens.vue'
import ActionListItemTransferTokens from '@/components/ActionListItemTransferTokens.vue'
import ActionListItemOther from '@/components/ActionListItemOther.vue'
import { AddressT } from '@radixdlt/account'

export default defineComponent({
  components: {
    ActionListItemStakeTokens,
    ActionListItemTransferTokens,
    ActionListItemUnstakeTokens,
    ActionListItemOther
  },

  props: {
    transaction: {
      type: Object as PropType<ExecutedTransaction>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    }
  },

  computed: {
    sentAt (): string {
      return DateTime.fromObject(this.transaction.sentAt as DateObject).toLocaleString(DateTime.DATETIME_SHORT)
    }
  }
})
</script>
