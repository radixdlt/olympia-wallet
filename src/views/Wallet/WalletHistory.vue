<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll">
    <div class="bg-rGrayLightest py-6 px-8 bg-gray">
      <h3 class="font-medium text-rBlack">{{ $t('history.historyHeading') }}</h3>

      <button @click="$emit('refresh')">Refresh</button>
      <button @click="$emit('next')">Next</button>
    </div>

    <div class="bg-white text-rBlack py-6 px-8 h-full">
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransaction } from '@radixdlt/application'
import { AddressT } from '@radixdlt/account'
import TransactionListItem from '@/components/TransactionListItem.vue'

const WalletHistory = defineComponent({
  components: {
    TransactionListItem
  },

  setup (_props, context) {
    context.emit('refresh')
  },

  props: {
    transactions: {
      type: Array as PropType<Array<ExecutedTransaction>>,
      required: true,
      default: []
    },
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    },
    pendingTransactions: {
      type: Array as PropType<Array<any>>,
      required: true,
      default: []
    }
  },

  emits: ['refresh', 'next']
})

export default WalletHistory
</script>
