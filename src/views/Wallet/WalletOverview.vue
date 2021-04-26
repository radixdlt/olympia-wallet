<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll overflow-x-hidden bg-white">
    <div class="bg-rGrayLightest py-6 px-8">
      <div class="flex justify-between mb-6">
        <h3 class="font-medium text-rBlack">{{ $t('wallet.balancesHeading') }}</h3>
        <div v-if="activeAddress" class="flex flex-row items-center text-sm text-rGrayMed">
          <span class="text-rBlack mr-4">{{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7.5" y="7.5" width="7" height="7" class="stroke-current"/>
              <path d="M13 5H5V13" class="stroke-current"/>
            </svg>
            <span>{{ $t('wallet.copyAddress') }}</span>
          </div>
        </div>
      </div>

      <div class="border border-rGray rounded-md flex flex-row mb-7 overflow-y-scroll">
        <img src="@/assets/token.svg" alt="token symbol" class="p-3 border-r border-rGray" />
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.totalTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalXRD" class="text-4xl font-light mr-4 text-rGreen" />
            <div class="font-thin text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end">XRD</div>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="availableXRD" class="text-4xl font-light mr-4 text-rBlack" />
            <div class="font-thin text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end">XRD</div>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalStaked" class="text-4xl font-light mr-4 text-rBlack" />
            <div class="font-thin text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end">XRD</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-7 px-8 flex-1">
      <div class="font-medium mb-8 flex items-center justify-between">
        {{ $t('wallet.additionalBalancesHeading') }}

        <button @click="$emit('requestFreeTokens')" class="text-rGreen py-2 px-4 border border-rGreen rounded-md">Get free tokens</button>
      </div>

      <div class="flex flex-row flex-wrap justify-between -mx-9">
        <div
          v-for="(tokenBalance, i) in otherTokenBalances"
          :key="i"
          class="w-1/2 px-9 mb-8"
        >
          <div class="flex flex-row py-1 divide-x divide-rGray border border-rGray rounded-md">
            <div class="flex items-center justify-center">
              <div class="p-4 m-4 bg-rGrayLight rounded-full">
                <img src="@/assets/balance.svg" alt="balances" />
              </div>
            </div>
            <div class="flex-1 flex flex-row items-center px-8 overflow-x-scroll">
              <big-amount :amount="tokenBalance.amount" class="text-4xl font-light mr-4 text-rBlack" />
              <div class="font-thin text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end">{{ tokenBalance.token.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { StakePosition, TokenBalance, TokenBalances } from '@radixdlt/application'
import { AccountAddressT } from '@radixdlt/account'
import { sumAmounts, subtract } from '@/helpers/arithmetic'
import { Amount, AmountT, Denomination } from '@radixdlt/primitives'
import BigAmount from '@/components/BigAmount.vue'

const WalletOverview = defineComponent({
  components: {
    BigAmount
  },

  props: {
    tokenBalances: {
      type: Object as PropType<TokenBalances>,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    activeStakes: {
      type: Array as PropType<Array<StakePosition>>,
      required: true
    }
  },

  computed: {
    totalXRD (): AmountT {
      return this.tokenBalances.tokenBalances
        ? sumAmounts(this.tokenBalances.tokenBalances.flatMap((item: TokenBalance) => item.amount)) || Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
        : Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
    },
    totalStaked (): AmountT {
      return sumAmounts(this.activeStakes.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
    },
    availableXRD (): AmountT {
      if (!this.totalStaked) return this.totalXRD
      if (!this.totalXRD) return Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
      else {
        const totalXRD: AmountT = this.totalXRD
        const totalStaked: AmountT = this.totalStaked
        const res = subtract(totalXRD, totalStaked)
        if (res.isOk()) return res.value
        else return Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
      }
    },
    otherTokenBalances (): TokenBalance[] {
      return this.tokenBalances.tokenBalances
        ? this.tokenBalances.tokenBalances.filter((item: TokenBalance) => item.token.name !== 'XRD')
        : []
    }
  },

  emits: ['requestFreeTokens']
})

export default WalletOverview
</script>
