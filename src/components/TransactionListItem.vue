<template>
  <div class="border border-rGray rounded-md flex flex-row mb-2 ml-12 mr-12">
    <div v-if="pending" class="bg-rGrayLightest text-rGrayDark text-sm pl-3 w-40 flex items-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
        <g clip-path="url(#clip0)">
        <path d="M6.81934 0V4" stroke="#003057" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M6.81934 10V14" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M2.70508 1.33691L5.05618 4.57291" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M8.58301 9.42676L10.9341 12.6628" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M0.162109 4.83691L3.96631 6.07291" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M9.67236 7.92676L13.4766 9.16276" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M0.162109 9.16276L3.96631 7.92676" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M9.67236 6.07291L13.4766 4.83691" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M2.70508 12.6628L5.05618 9.42676" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M8.58301 4.57291L10.9341 1.33691" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        </g>
        <defs>
        <clipPath id="clip0">
        <rect width="13.6388" height="14" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    </div>
    <div v-else class="bg-rGrayLightest text-rGrayDark text-sm pl-3 w-40 flex items-center">
      {{ sentAt }}
    </div>
    <div class="flex-1">
      <div class="py-3.5 px-3">
        <div v-for="(action, i) in transaction.actions" :key="i">
          <action-list-item-stake-tokens
            v-if="action.type === 'StakeTokens'"
            :action="action"
            :index="i"
            :nativeToken="nativeToken"
          />
          <action-list-item-unstake-tokens
            v-else-if="action.type === 'UnstakeTokens'"
            :action="action"
            :index="i"
            :nativeToken="nativeToken"
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
      <div v-if="message" class="text-sm px-3 py-2 bg-rGrayLightest bg-opacity-60 flex items-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-1 h-5">
          <path d="M15 5H5V11.1288H10.9545L13.3094 13.3889V11.1288H15V5Z" stroke="#7A99AC" stroke-miterlimit="10"/>
          <line x1="6.2002" y1="7" x2="13.7002" y2="7" stroke="#7A99AC"/>
          <line x1="6.2002" y1="9" x2="13.7002" y2="9" stroke="#7A99AC"/>
        </svg>

        <span>{{ message }}</span>
      </div>
    </div>
    <div class="bg-rGrayLightest flex items-center justify-center px-3">
      <a :href="explorerURL" target="_blank" class="w-6 h-6 rounded-full border border-rGray flex items-center justify-center cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.66797 3.60449H10.9101V10.8466" stroke="#7A99AC" stroke-miterlimit="10"/>
        <path d="M10.9096 3.60449L3.60449 10.9097" stroke="#7A99AC" stroke-miterlimit="10"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransaction, AccountAddressT, Token } from '@radixdlt/application'
import { DateTime } from 'luxon'
import ActionListItemStakeTokens from '@/components/ActionListItemStakeTokens.vue'
import ActionListItemUnstakeTokens from '@/components/ActionListItemUnstakeTokens.vue'
import ActionListItemTransferTokens from '@/components/ActionListItemTransferTokens.vue'
import ActionListItemOther from '@/components/ActionListItemOther.vue'

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
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    pending: {
      type: Boolean,
      required: true
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: true
    },
    message: {
      type: String as PropType<string>,
      required: false,
      default: null
    }
  },

  computed: {
    sentAt (): string {
      return DateTime.fromJSDate(this.transaction.sentAt).toLocaleString(DateTime.DATETIME_SHORT)
    },
    explorerURL (): string {
      return `${process.env.VUE_APP_EXPLORER}/#/transactions/${this.transaction.txID}`
    }
  }
})
</script>
