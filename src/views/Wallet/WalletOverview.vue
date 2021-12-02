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
            <div v-if="loading" class="text-2xl font-light mr-4 text-rGreen">--</div>
            <big-amount :amount="availablePlusStakedAndUnstakedXRD" class="text-2xl font-light mr-4 text-rGreen" v-else />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <div v-if="loading" class="text-2xl font-light mr-4 text-rBlack">--</div>
            <big-amount :amount="totalXRD" class="text-2xl font-light mr-4 text-rBlack" v-else />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <div v-if="loading" class="text-2xl font-light mr-4 text-rBlack">--</div>
            <big-amount :amount="totalStakedAndUnstaked" class="text-2xl font-light mr-4 text-rBlack" v-else />
            <token-symbol>{{ nativeToken && nativeToken.symbol }}</token-symbol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-4 px-8 flex-1">
      <div class="grid grid-cols-2 gap-4" v-if="!loading">
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
import { defineComponent, computed, ComputedRef, ref, Ref, onMounted } from 'vue'
import { merge, forkJoin, interval, Subject, Subscription } from 'rxjs'
import { switchMap, mergeMap } from 'rxjs/operators'
import { StakePosition, Amount, AmountT, Token, SimpleTokenBalance, StakePositions, StakePositionsEndpoint, UnstakePositionsEndpoint, SimpleTokenBalances } from '@radixdlt/application'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import OtherTokenBalanceListItem from '@/components/OtherTokenBalanceListItem.vue'
import { createRRIUrl } from '@/helpers/explorerLinks'
import { truncateRRIStringForDisplay } from '@/helpers/formatter'
import { sumAmounts, add } from '@/helpers/arithmetic'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useNativeToken, useWallet } from '@/composables'

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
      explorerUrlBase,
      radix,
      verifyHardwareWalletAddress,
      hasWallet
    } = useWallet(router)

    const subs = new Subscription()

    const pageTrigger = new Subject<number>()
    const loading = ref(true)

    onMounted(() => {
      pageTrigger.next(Math.random())
    })

    const { nativeToken } = useNativeToken(radix)
    const tokenBalances: Ref<SimpleTokenBalances | null> = ref(null)
    const activeStakes: Ref<StakePositions> = ref([])
    const activeUnstakes: Ref<UnstakePositionsEndpoint.DecodedResponse> = ref([])
    const updateObservable = merge(
      radix.activeAccount,
      interval(15000)
    )

    subs.add(radix.activeAddress.subscribe(() => {
      loading.value = true
    }))

    const balanceSub = updateObservable.pipe(
      switchMap(() => radix.activeAccount),
      mergeMap((account: any) => forkJoin([
        radix.ledger.tokenBalancesForAddress(account.address),
        radix.ledger.stakesForAddress(account.address),
        radix.ledger.unstakesForAddress(account.address)
      ]))
    ).subscribe(([balances, stakes, unstakes]: [any, any, any]) => {
      tokenBalances.value = balances
      activeStakes.value = stakes
      activeUnstakes.value = unstakes
      loading.value = false
    })
    subs.add(balanceSub)

    onBeforeRouteLeave(() => {
      subs.unsubscribe()
    })

    if (!hasWallet) {
      router.push('/')
      return {}
    }

    const tokenBalanceFor = (token: Token) => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.tokenBalances.find((tb: SimpleTokenBalance) => tb.tokenIdentifier.equals(token.rri)) || null
    }

    const zero = Amount.fromUnsafe(0)._unsafeUnwrap()

    const totalXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return zero
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return zero
      const xrdAmount = Amount.fromUnsafe(nativeTokenBalance.amount)
      return xrdAmount.isErr() ? zero : xrdAmount.value
    })

    const totalStakedAndUnstaked: ComputedRef<AmountT> = computed(() => {
      if (!activeStakes.value || !activeUnstakes.value) return zero
      const totalStakedAndUnstaked = sumAmounts(activeStakes.value.flatMap((item: StakePosition) => item.amount)) || zero
      const totalUnstaked = sumAmounts(activeUnstakes.value.flatMap((item: StakePosition) => item.amount)) || zero
      return sumAmounts([totalStakedAndUnstaked, totalUnstaked]) || zero
    })

    const availablePlusStakedAndUnstakedXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return zero
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return zero
      if (!activeStakes.value || !activeUnstakes.value) return zero

      const xrdAmount = Amount.fromUnsafe(nativeTokenBalance.amount)
      const totalXRD = xrdAmount.isErr() ? zero : xrdAmount.value

      const totalStakedAndUnstaked = sumAmounts(activeStakes.value.flatMap((item: StakePosition) => item.amount)) || zero
      const totalUnstaked = sumAmounts(activeUnstakes.value.flatMap((item: StakePosition) => item.amount)) || zero
      const totalStakedAndUnstakedSum = sumAmounts([totalStakedAndUnstaked, totalUnstaked]) || zero
      return add(totalXRD, totalStakedAndUnstakedSum)
    })

    const otherTokenBalances: ComputedRef<SimpleTokenBalance[]> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return []
      return tokenBalances.value.tokenBalances.filter((tb: SimpleTokenBalance) => {
        return nativeToken.value && !tb.tokenIdentifier.equals(nativeToken.value.rri)
      })
    })

    return {
      activeAddress,
      activeStakes,
      activeUnstakes,
      explorerUrlBase,
      loading,
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
