<template>
  <div class="flex flex-col flex-1 bg-white text-rBlack py-6 px-8">
    <h3 class="font-medium text-rBlack mb-4">{{ $t('wallet.recentTransactionsHeading') }}</h3>
    <div v-for="(txn, i) in transactionHistory.transactions" :key="i">
      <pre class="text-xs p-4 bg-gray-100 rounded mb-4">ID: {{txn.txID.toString()}}</pre>
      <pre v-for="(action, i) in txn.actions" :key="i" class="text-xs p-4 bg-gray-100 rounded ml-4 mb-2">{{ action.type }} : {{ action.amount }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TransactionHistory } from '@radixdlt/application'

const WalletHistory = defineComponent({
  props: {
    transactionHistory: {
      type: Object as PropType<TransactionHistory>,
      required: true
    }
  }
})

export default WalletHistory
</script>
