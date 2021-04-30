<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll bg-white">
    <div class="bg-rGrayLightest py-6 px-8 bg-gray">
      <div class="flex justify-between">
        <h3 class="font-medium text-rBlack">{{ $t('history.historyHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm">
          <span class="text-rBlack mr-4">{{ $t('wallet.currentAddress') }} {{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy :text="activeAddress.toString()">
            </click-to-copy>
          </div>
        </div>
      </div>
    </div>

    <div class="text-rBlack py-6 min-h-full">
      <transaction-list-item
        v-for="(txn, i) in pendingTransactions"
        :key="i"
        :transaction="txn"
        :index="i"
        :activeAddress="activeAddress"
        :pending="true"
      />

      <transaction-list-item
        v-for="(txn, i) in transactions"
        :key="i"
        :transaction="txn"
        :index="i"
        :activeAddress="activeAddress"
        :pending="false"
      />

      <!-- <div class="flex flex-row items-center text-rGrayDark justify-between py-5">
        <button v-if="canGoBack" @click="$emit('previous')" class="flex flex-row items-center hover:text-rGreen transition-colors">
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
            <g clip-path="url(#clip0)">
            <path d="M9.95508 14.7568L4.83414 9.6359L9.95508 4.51496" class="stroke-current" stroke-miterlimit="10"/>
            <path d="M4.83451 9.63627L15.1655 9.63622" class="stroke-current" stroke-miterlimit="10"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
            </defs>
          </svg>
          <span>{{ $t('history.previous') }}</span>
        </button>
        <div v-else></div>
        <button v-if="canGoNext" @click="$emit('next')" class="flex flex-row items-center hover:text-rGreen">
          <span class="mr-3">{{ $t('history.next') }}</span>
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
            <path d="M10.0449 5.24316L15.1659 10.3641L10.0449 15.485" class="stroke-current" stroke-miterlimit="10"/>
            <path d="M15.1655 10.3637L4.83446 10.3638" class="stroke-current" stroke-miterlimit="10"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
            </defs>
          </svg>
        </button>
        <div v-else></div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransaction } from '@radixdlt/application'
import { AccountAddressT } from '@radixdlt/account'
import TransactionListItem from '@/components/TransactionListItem.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'

const WalletHistory = defineComponent({
  components: {
    TransactionListItem,
    ClickToCopy
  },

  props: {
    transactions: {
      type: Array as PropType<Array<ExecutedTransaction>>,
      required: true,
      default: []
    },
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    pendingTransactions: {
      type: Array as PropType<Array<any>>,
      required: true,
      default: []
    },
    canGoBack: {
      type: Boolean,
      required: true
    },
    canGoNext: {
      type: Boolean,
      required: true
    }
  },

  emits: ['next', 'previous']
})

export default WalletHistory
</script>
