<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll overflow-x-hidden bg-white">
    <div class="bg-rGrayLightest py-6 px-8">
      <div class="flex justify-between mb-6">
        <h3 class="font-medium text-rBlack">{{ $t('wallet.balancesHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm">
          <span class="text-rBlack mr-4">{{ $t('wallet.currentAddress') }} {{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy :text="activeAddress.toString()">
            </click-to-copy>
          </div>
        </div>
      </div>

      <div class="border border-rGray bg-white rounded-md flex flex-row mb-7 overflow-y-scroll">
        <img src="@/assets/token.svg" alt="token symbol" class="p-3 border-r border-rGray" />
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.totalTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalXRD" class="text-4xl font-light mr-4 text-rGreen" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="availableXRD" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalStaked" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-7 px-8 flex-1">
      <div class="font-medium mb-8 flex items-center justify-between">
        {{ $t('wallet.additionalBalancesHeading') }}
        <button @click="$emit('requestFreeTokens')" class="focus:outline-none text-rGreen py-2 px-4 border border-rGreen rounded-md hover:bg-translucent-greenLighter active:bg-translucent-greenLight">Get free betanet tokens</button>
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

    <div class="fixed bottom-0 bg-rGrayLightest flex p-4">
      <div class="border-2 rounded-md border-rRed text-rRed p-4 flex self-center font-bold">
        <span> WARNING </span>
      </div>
      <div class="p-4 text-sm text-rBlack">
        This wallet connects to a temporary Radix betanet test network only. All tokens and transactions in this wallet are for testing purposes only. Tokens you see in this wallet have no value, and you cannot use it to hold real eXRD or XRD tokens.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { StakePosition, Token, TokenBalance, TokenBalances, AccountAddressT, Amount, AmountT } from '@radixdlt/application'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'

const WalletOverview = defineComponent({
  components: {
    BigAmount,
    TokenSymbol,
    ClickToCopy
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
      required: true
    },
    nativeTokenBalance: {
      type: Object as PropType<TokenBalance>,
      required: false
    }
  },

  computed: {
    totalXRD (): AmountT {
      if (!this.nativeTokenBalance) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const xrdAmount = Amount.fromUnsafe(this.nativeTokenBalance.amount)
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
      if (!this.nativeToken || !this.tokenBalances.tokenBalances) return []
      else return this.tokenBalances.tokenBalances.filter((tb: TokenBalance) => !tb.token.rri.equals(this.nativeToken.rri))
    }
  },

  emits: ['requestFreeTokens']
})

export default WalletOverview
</script>
