<template>
  <div class="bg-white text-rBlack pt-headerHeight pb-8 px-11 flex-1">
    <div class="font-medium leading-snug">Current Balance</div>
    <img alt="Balance" src="../../assets/balance.svg" class="mr-4">
    <div class="flex flex-col">
      <div v-for="(tokenBalance, i) in tokenBalances.tokenBalances" :key="i" class="flex flex-row items-end">
        <div class="text-7xl font-thin mr-4">{{ tokenBalance.amount.toString() }}</div>
        <div class="text-4xl font-thin self-end">{{ tokenBalance.token.name }}</div>
      </div>
    </div>

    <div v-for="(txn, i) in transactionHistory.transactions" :key="i">
      <div class="text-sm">ID: {{txn.txID.toString()}}</div>
      <div v-for="(action, i) in txn.actions" :key="i">
        {{ action.type }} : {{ action.amount }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TokenBalance } from '@/mockRadix'
import { TransactionHistory } from '@radixdlt/application'

const WalletOverview = defineComponent({
  props: {
    tokenBalances: {
      type: Object as PropType<TokenBalance>,
      required: true
    },
    transactionHistory: {
      type: Object as PropType<TransactionHistory>,
      required: true
    }
  }
})

export default WalletOverview
</script>
