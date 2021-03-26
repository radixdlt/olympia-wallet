<template>
  <div class="bg-white text-rBlack pt-headerHeight pb-8 px-11 flex-1">
    <div class="font-medium leading-snug">Current Balance</div>
    <div class="flex flex-row">
      <img alt="Balance" src="../../assets/balance.svg" class="mr-4">
      <div v-for="(tokenBalance, i) in tokenBalances.tokenBalances" :key="i" class="flex flex-row items-end">
        <div class="text-7xl font-thin mr-4">{{ tokenBalance.amount.toString() }}</div>
        <div class="text-4xl font-thin self-end">{{ tokenBalance.token.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Prop, PropType } from 'vue'
import { TokenBalance } from '@/mockRadix'

const WalletOverview = defineComponent({
  props: {
    tokenBalances: {
      type: Object as PropType<TokenBalance>,
      required: true
    }
  }
})

export default WalletOverview
</script>
