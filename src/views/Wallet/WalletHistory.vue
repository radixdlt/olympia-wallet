<template>
  <div class="flex flex-col flex-1 min-w-0">
    <div class="bg-rGrayLightest py-6 px-8 bg-gray">
      <h3 class="font-medium text-rBlack">{{ $t('history.historyHeading') }}</h3>
    </div>

    <div class="bg-white text-rBlack py-6 px-8">
      <transaction-list-item
        v-for="(txn, i) in transactionHistory.transactions"
        :key="i"
        :transaction="txn"
        :index="i"
        :activeAddress="activeAddress"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TransactionHistory } from '@radixdlt/application'
import { AddressT } from '@radixdlt/account'
import TransactionListItem from '@/components/TransactionListItem.vue'

const WalletHistory = defineComponent({
  components: {
    TransactionListItem
  },

  props: {
    transactionHistory: {
      type: Object as PropType<TransactionHistory>,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    }
  }
})

export default WalletHistory
</script>
