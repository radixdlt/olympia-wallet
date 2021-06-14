<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll overflow-x-hidden bg-white">
    <div class="bg-rGrayLightest px-8">
      <div class="flex justify-between mb-4 pt-4">
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
            <big-amount :amount="availablePlusStakedAndUnstakedXRD" class="text-4xl font-light mr-4 text-rGreen" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalXRD" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalStakedAndUnstaked" class="text-4xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken.symbol }}</token-symbol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-4 px-8 flex-1">
      <div v-if="!fetchingFreeTokens" class="font-medium mb-6 flex items-center justify-between">
        {{ $t('wallet.additionalBalancesHeading') }}
        <button @click="requestFreeTokens" class="focus:outline-none text-rGreen py-2 px-4 border border-rGreen rounded-md hover:bg-translucent-greenLighter active:bg-translucent-greenLight">Get free betanet tokens</button>
      </div>
      <div v-else class="font-medium mb-6 flex items-center justify-between">
        {{ $t('wallet.additionalBalancesHeading') }}
        <button disabled class="flex items-center focus:outline-none text-rGrayDark py-2 px-4 border border-rGrayDark rounded-md cursor-wait">
          <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin mr-2">
            <g clip-path="url(#clip0)">
              <path d="M6.8194 0.5V4.5" stroke="#003057" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M6.8194 10.5V14.5" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M2.7049 1.8369L5.056 5.0729" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M8.5828 9.9271L10.9339 13.1631" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M0.161999 5.3369L3.9662 6.5729" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M9.6726 8.4271L13.4768 9.6631" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M0.161999 9.6631L3.9662 8.4271" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M9.6726 6.5729L13.4768 5.3369" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M2.7049 13.1631L5.056 9.9271" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
              <path d="M8.5828 5.0729L10.9339 1.8369" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.0485" stroke-miterlimit="10"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="13.6388" height="14" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
            </defs>
          </svg>
          Fetching tokens...
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="(tokenBalance, i) in otherTokenBalances"
          :key="i"
          class="border border-rGray rounded-md divide-x divide-rGray"
        >
          <div class="flex flex-row py-1">
            <div class="flex-1 flex flex-row items-center px-4 overflow-x-scroll p-2 m-2.5">
              <big-amount :amount="tokenBalance.amount" class="text-4xl font-light mr-4 text-rBlack" />
              <token-symbol>{{ tokenBalance.token.symbol.toUpperCase() }}</token-symbol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 bg-rGrayLightest flex py-2 px-4">
      <div class="border-2 rounded-md border-rRed text-rRed py-2 px-4 flex self-center font-bold">
        <span> WARNING </span>
      </div>
      <div class="px-4 py-2 text-sm text-rBlack">
        This wallet connects to a temporary Radix betanet test network only. All tokens and transactions are for testing purposes only. Tokens you see in this wallet have no value, and you cannot use it to hold real eXRD or XRD tokens.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref } from 'vue'
import { StakePosition, Token, TokenBalance, TokenBalances, AccountAddressT, Amount, AmountT, UnstakePosition } from '@radixdlt/application'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { ref } from '@nopr3d/vue-next-rx'
import { sumAmounts, subtract, add } from '@/helpers/arithmetic'

const WalletOverview = defineComponent({
  components: {
    BigAmount,
    TokenSymbol,
    ClickToCopy
  },

  setup () {
    const fetchingFreeTokens: Ref<boolean> = ref(false)

    return { fetchingFreeTokens }
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
    activeUnstakes: {
      type: Array as PropType<Array<UnstakePosition>>,
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
    totalStakedAndUnstaked (): AmountT {
      const totalStakedAndUnstaked = sumAmounts(this.activeStakes.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalUnstaked = sumAmounts(this.activeUnstakes.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      return sumAmounts([totalStakedAndUnstaked, totalUnstaked]) || Amount.fromUnsafe(0)._unsafeUnwrap()
    },
    availablePlusStakedAndUnstakedXRD (): AmountT {
      const totalXRD: AmountT = this.totalXRD || Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalStakedAndUnstaked: AmountT = this.totalStakedAndUnstaked || Amount.fromUnsafe(0)._unsafeUnwrap()
      return add(totalXRD, totalStakedAndUnstaked)
    },
    otherTokenBalances (): TokenBalance[] {
      if (!this.nativeToken || !this.tokenBalances.tokenBalances) return []
      else return this.tokenBalances.tokenBalances.filter((tb: TokenBalance) => !tb.token.rri.equals(this.nativeToken.rri))
    }
  },

  methods: {
    requestFreeTokens () {
      this.$emit('requestFreeTokens')
      this.fetchingFreeTokens = true
      setTimeout(() => { this.fetchingFreeTokens = false }, 30000)
    }
  },

  emits: ['requestFreeTokens']
})

export default WalletOverview
</script>
