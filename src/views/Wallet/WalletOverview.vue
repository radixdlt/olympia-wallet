<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-white">
    <div class="bg-rGrayLightest px-8">
      <div class="flex justify-between mb-4 pt-4">
        <h3 class="font-medium text-rBlack">{{ $t('wallet.balancesHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm" v-if="activeAddress">
          <span class="text-rGrayDark mr-2">{{ $t('wallet.currentAddress') }}</span> <span class="font-mono text-rBlack">{{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy
              :address="activeAddress.toString()"
              :checkForHardwareAddress=true
              @verifyHardwareAddress="verifyHardwareWalletAddress()"
            />
          </div>
        </div>
      </div>

      <div class="border border-rGray bg-white rounded-md flex flex-row mb-7 overflow-y-auto">
        <img src="@/assets/token.svg" alt="token symbol" class="p-3 border-r border-rGray" />
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.totalTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="availablePlusStakedAndUnstakedXRD" class="text-2xl font-light mr-4 text-rGreen" />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalXRD" class="text-2xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <big-amount :amount="totalStakedAndUnstaked" class="text-2xl font-light mr-4 text-rBlack" />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-4 px-8 flex-1">
      <div class="grid grid-cols-2 gap-4">
        <other-token-balance-list-item
          v-for="(tokenBalance, i) in otherTokenBalances"
          :key="i"
          :tokenBalance="tokenBalance"
          :explorerUrlBase="explorerUrlBase"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef } from 'vue'
import { StakePosition, TokenBalance, Amount, AmountT } from '@radixdlt/application'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import OtherTokenBalanceListItem from '@/components/OtherTokenBalanceListItem.vue'
import { createRRIUrl } from '@/helpers/explorerLinks'
import { truncateRRIStringForDisplay } from '@/helpers/formatter'
import { sumAmounts, add } from '@/helpers/arithmetic'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useNativeToken, useStaking, useWallet, useTokenBalances, useExplorerUrl } from '@/composables'

const WalletOverview = defineComponent({
  components: {
    BigAmount,
    ClickToCopy,
    OtherTokenBalanceListItem,
    TokenSymbol
  },

  setup () {
    const router = useRouter()
    const {
      activeAddress,
      radix,
      verifyHardwareWalletAddress,
      hasWallet
    } = useWallet(router)

    const { tokenBalances, tokenBalancesUnsub, tokenBalanceFor } = useTokenBalances(radix)
    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)
    const { activeStakes, activeUnstakes, stakingUnsub } = useStaking(radix)
    const { explorerUrlBase, explorerUrlUnsub } = useExplorerUrl(radix)

    onBeforeRouteLeave(() => {
      tokenBalancesUnsub()
      nativeTokenUnsub()
      stakingUnsub()
      explorerUrlUnsub()
    })

    if (!hasWallet) {
      router.push('/')
      return {}
    }

    const totalXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const xrdAmount = Amount.fromUnsafe(nativeTokenBalance.amount)
      return xrdAmount.isErr() ? Amount.fromUnsafe(0)._unsafeUnwrap() : xrdAmount.value
    })

    const totalStakedAndUnstaked: ComputedRef<AmountT> = computed(() => {
      if (!activeStakes.value || !activeUnstakes.value) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalStakedAndUnstaked = sumAmounts(activeStakes.value.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalUnstaked = sumAmounts(activeUnstakes.value.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      return sumAmounts([totalStakedAndUnstaked, totalUnstaked]) || Amount.fromUnsafe(0)._unsafeUnwrap()
    })

    const availablePlusStakedAndUnstakedXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return Amount.fromUnsafe(0)._unsafeUnwrap()
      if (!activeStakes.value || !activeUnstakes.value) return Amount.fromUnsafe(0)._unsafeUnwrap()

      const xrdAmount = Amount.fromUnsafe(nativeTokenBalance.amount)
      const totalXRD = xrdAmount.isErr() ? Amount.fromUnsafe(0)._unsafeUnwrap() : xrdAmount.value

      const totalStakedAndUnstaked = sumAmounts(activeStakes.value.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalUnstaked = sumAmounts(activeUnstakes.value.flatMap((item: StakePosition) => item.amount)) || Amount.fromUnsafe(0)._unsafeUnwrap()
      const totalStakedAndUnstakedSum = sumAmounts([totalStakedAndUnstaked, totalUnstaked]) || Amount.fromUnsafe(0)._unsafeUnwrap()

      return add(totalXRD, totalStakedAndUnstakedSum)
    })

    const otherTokenBalances: ComputedRef<TokenBalance[]> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return []
      return tokenBalances.value.tokenBalances.filter((tb: TokenBalance) => {
        return nativeToken.value && !tb.token.rri.equals(nativeToken.value.rri)
      })
    })

    return {
      activeAddress,
      activeStakes,
      activeUnstakes,
      explorerUrlBase,
      nativeToken,
      tokenBalances,
      totalXRD,
      totalStakedAndUnstaked,
      otherTokenBalances,
      availablePlusStakedAndUnstakedXRD,
      verifyHardwareWalletAddress,
      createRRIUrl,
      truncateRRIStringForDisplay
    }
  }
})

export default WalletOverview
</script>
