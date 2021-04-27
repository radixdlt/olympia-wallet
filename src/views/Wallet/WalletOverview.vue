<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll overflow-x-hidden bg-white">
    <div class="bg-rGrayLightest py-6 px-8">
      <div class="flex justify-between mb-6">
        <h3 class="font-medium text-rBlack">{{ $t('wallet.balancesHeading') }}</h3>
        <div v-if="activeAddress" class="flex flex-row items-center text-sm text-rGrayMed">
          <span class="text-rBlack mr-4">{{ $t('wallet.currentAddress') }} {{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7.5" y="7.5" width="7" height="7" class="stroke-current"/>
              <path d="M13 5H5V13" class="stroke-current"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="border border-rGray rounded-md flex flex-row mb-7 overflow-y-scroll">
        <img src="@/assets/token.svg" alt="token symbol" class="p-3 border-r border-rGray" />
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.totalTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalXRD" class="text-4xl font-light mr-4 text-rGreen" />
            <token-symbol>XRD</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="availableXRD" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>XRD</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalStaked" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>XRD</token-symbol>
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
            <div class="flex-1 flex flex-row items-center px-8 overflow-x-scroll p-2 m-2.5">
              <big-amount :amount="tokenBalance.amount" class="text-4xl font-light mr-4 text-rBlack" />
              <token-symbol>{{ tokenBalance.token.symbol.toUpperCase() }}</token-symbol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { StakePosition, Token, TokenBalance, TokenBalances } from '@radixdlt/application'
import { AccountAddressT } from '@radixdlt/account'
import { sumAmounts, subtract } from '@/helpers/arithmetic'
import { Amount, AmountT } from '@radixdlt/primitives'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'

const WalletOverview = defineComponent({
  components: {
    BigAmount,
    TokenSymbol
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
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: false
    }
  },

  computed: {
    totalXRD (): AmountT {
      if (!this.nativeToken) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const xrdTokenBalance = this.tokenBalances.tokenBalances.find((tb: TokenBalance) => tb.token.rri.equals(this.nativeToken!.rri))
      if (!xrdTokenBalance) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const xrdAmount = Amount.fromUnsafe(xrdTokenBalance.amount)
      return xrdAmount.isErr() ? Amount.fromUnsafe(0)._unsafeUnwrap() : xrdAmount.value
    },
    totalStaked (): AmountT {
      return Amount.fromUnsafe(0)._unsafeUnwrap()
      // return sumAmounts(this.activeStakes.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
    },
    availableXRD (): AmountT {
      // TODO: remove this when staking is implemented
      return this.totalXRD

      // if (!this.totalStaked) return this.totalXRD
      // if (!this.totalXRD) return Amount.fromUnsafe(0)._unsafeUnwrap()
      // else {
      //   const totalXRD: AmountT = this.totalXRD
      //   const totalStaked: AmountT = this.totalStaked
      //   return subtract(totalXRD, totalStaked)
      //   // if (res.isOk()) return res.value
      //   // else return Amount.fromUnsafe(0)._unsafeUnwrap()
      // }
    },
    otherTokenBalances (): TokenBalance[] {
      return this.tokenBalances.tokenBalances
        ? this.tokenBalances.tokenBalances.filter((item: TokenBalance) => item.token.symbol !== 'xrd')
        : []
    }
  },

  emits: ['requestFreeTokens']
})

export default WalletOverview
</script>
