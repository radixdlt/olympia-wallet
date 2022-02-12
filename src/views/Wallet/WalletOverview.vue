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
            <token-symbol :rriUrl="nativeTokenRRIUrl">
              <template v-slot:symbol>{{ nativeToken && nativeToken.symbol }}</template>
              <template v-slot:hoverText>{{ nativeToken && nativeToken.rri.toString() }}</template>
            </token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 border-r border-rGray flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.availableTokens') }}</span>
          <div class="flex flex-row items-end">
            <div v-if="loading" class="text-2xl font-light mr-4 text-rBlack">--</div>
            <big-amount :amount="totalXRD" class="text-2xl font-light mr-4 text-rBlack" v-else />
            <token-symbol :rriUrl="nativeTokenRRIUrl">
              <template v-slot:symbol>{{ nativeToken && nativeToken.symbol }}</template>
              <template v-slot:hoverText>{{ nativeToken && nativeToken.rri.toString() }}</template>
            </token-symbol>
          </div>
        </div>
        <div class="flex flex-col my-3 px-5 flex-1">
          <span class="text-sm text-rGrayDark">{{ $t('wallet.stakedTokens') }}</span>
          <div class="flex flex-row items-end">
            <div v-if="loading" class="text-2xl font-light mr-4 text-rBlack">--</div>
            <big-amount :amount="totalStakedAndUnstaked" class="text-2xl font-light mr-4 text-rBlack" v-else />
            <token-symbol :rriUrl="nativeTokenRRIUrl">
              <template v-slot:symbol>{{ nativeToken && nativeToken.symbol }}</template>
              <template v-slot:hoverText>{{ nativeToken && nativeToken.rri.toString() }}</template>
            </token-symbol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white text-rBlack py-4 px-8 flex-1">
      <div class="grid grid-cols-2 gap-4" v-if="!loading && !loadingRelatedTokens">
        <other-token-balance-list-item
          v-for="tokenBalance in otherTokenBalances"
          :key="tokenBalance"
          :tokenBalance="tokenBalance"
          :explorerUrlBase="explorerUrlBase"
          @hideToken="handleRequestHideToken"
        />
      </div>
    </div>

    <AppModal
      :visible="!!tokenToHide"
      :title="$t('wallet.hideBalanceModalTitle')"
    >
      <template v-slot:icon>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.2273 8.36363C22.7917 7.99744 24.3933 7.8144 26 7.81817C41.9091 7.81817 51 26 51 26C49.6204 28.5809 47.9751 31.0108 46.0909 33.25M39.5 39.5C35.615 42.4614 30.8843 44.102 26 44.1818C10.0909 44.1818 1 26 1 26C3.82702 20.7316 7.74803 16.1286 12.5 12.5L39.5 39.5Z" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1 1L51 51" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M32.7991 32.7989C31.9062 33.6918 30.8462 34.4 29.6796 34.8832C28.513 35.3665 27.2627 35.6152 26 35.6152C24.7373 35.6152 23.4869 35.3665 22.3203 34.8832C21.1537 34.4 20.0937 33.6918 19.2009 32.7989C18.308 31.906 17.5997 30.846 17.1165 29.6794C16.6333 28.5128 16.3846 27.2625 16.3846 25.9998C16.3846 24.7371 16.6333 23.4867 17.1165 22.3201C17.5997 21.1535 18.308 20.0936 19.2009 19.2007" stroke="#052CC0" stroke-width="1.5"/>
          <path d="M23.8131 16.6364C25.3963 16.2667 27.0474 16.3045 28.6121 16.7462C30.1767 17.1879 31.6038 18.0191 32.76 19.1622C33.9161 20.3052 34.7635 21.7228 35.223 23.2823C35.6826 24.8418 35.7391 26.4924 35.3875 28.0797" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      <template v-slot:content>
        <p class="mb-5">{{ $t('wallet.hideBalanceModalContent', { tokenName: tokenToHide ? tokenToHide.name : 'emunie' }) }}</p>
        <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel class="w-44" @click="tokenToHide = null">{{ $t('general.cancel') }}</AppButtonCancel>
        <AppButtonSubmit class="w-44" @click="handleHideToken">{{ $t('wallet.hideBalanceModalSubmit') }}</AppButtonSubmit>
      </div>
      </template>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef, ref, Ref, onMounted, onUnmounted } from 'vue'
import { merge, forkJoin, interval, Subject, Subscription } from 'rxjs'
import { switchMap, mergeMap } from 'rxjs/operators'
import { Amount, AmountT, Token } from '@radixdlt/application'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import AppModal from '@/components/AppModal.vue'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppButtonSubmit from '@/components/AppButtonSubmit.vue'
import OtherTokenBalanceListItem from '@/components/OtherTokenBalanceListItem.vue'
import { createRRIUrl } from '@/helpers/explorerLinks'
import { truncateRRIStringForDisplay } from '@/helpers/formatter'
import { add } from '@/helpers/arithmetic'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { hideTokenType, getHiddenTokens } from '@/actions/vue/data-store'
import { useNativeToken, useTokenBalances, useWallet } from '@/composables'
import { Observed } from '@/helpers/typeHelpers'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'

const WalletOverview = defineComponent({
  components: {
    AppButtonCancel,
    AppButtonSubmit,
    AppModal,
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
    const { tokenBalances, tokenBalanceFor, tokenBalancesUnsub, loadingRelatedTokens } = useTokenBalances(radix)

    const subs = new Subscription()

    const pageTrigger = new Subject<number>()
    const loading = ref(true)
    const hiddenTokens: Ref<string[]> = ref([])

    onMounted(() => {
      pageTrigger.next(Math.random())
      getHiddenTokens().then((res: string[]) => { hiddenTokens.value = res })
    })

    onUnmounted(() => {
      tokenBalancesUnsub()
    })

    const { nativeToken } = useNativeToken(radix)
    const activeStakes: Ref<Observed<ReturnType<typeof radix.ledger.stakesForAddress>> | null> = ref(null)
    const activeUnstakes: Ref<Observed<ReturnType<typeof radix.ledger.unstakesForAddress>> | null> = ref(null)
    const tokenToHide: Ref<Token | null> = ref(null)
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
        radix.ledger.stakesForAddress(account.address),
        radix.ledger.unstakesForAddress(account.address)
      ]))
    ).subscribe(([stakes, unstakes]) => {
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

    const zero = Amount.fromUnsafe(0)._unsafeUnwrap()

    const totalXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return zero
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return zero
      return nativeTokenBalance.value
    })

    const totalStakedAndUnstaked: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value) return zero
      return tokenBalances.value.account_balances.staked_and_unstaking_balance.value || zero
    })

    const availablePlusStakedAndUnstakedXRD: ComputedRef<AmountT> = computed(() => {
      return add(totalXRD.value, totalStakedAndUnstaked.value)
    })

    // Check if token RRI is present in list of hidden tokens
    const isTokenHidden = (ht: string[], tb: Decoded.TokenAmount): boolean =>
      ht.find((hiddenT: string) => { return tb.token_identifier.rri.toString() === hiddenT }) !== undefined

    const handleRequestHideToken = (token: Token) => {
      tokenToHide.value = token
    }

    const handleHideToken = () => {
      if (tokenToHide.value) {
        hideTokenType(tokenToHide.value.rri)
          .then((res: string[]) => {
            hiddenTokens.value = res
          })
      }
      tokenToHide.value = null
    }

    const otherTokenBalances: ComputedRef<Decoded.TokenAmount[]> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return []
      return tokenBalances.value.account_balances.liquid_balances.filter((tb) => {
        return !tb.token_identifier.rri.equals(nativeToken.value!.rri) && !isTokenHidden(hiddenTokens.value, tb)
      })
    })

    const nativeTokenRRIUrl: ComputedRef<string> = computed(() => {
      if (nativeToken.value && explorerUrlBase) {
        return `${explorerUrlBase.value}/#/tokens/${nativeToken.value.rri.toString()}`
      } else {
        return `${explorerUrlBase}/#/`
      }
    })

    return {
      activeAddress,
      activeStakes,
      activeUnstakes,
      explorerUrlBase,
      hiddenTokens,
      loading,
      loadingRelatedTokens,
      nativeToken,
      nativeTokenRRIUrl,
      tokenBalances,
      tokenToHide,
      totalXRD,
      totalStakedAndUnstaked,
      otherTokenBalances,
      availablePlusStakedAndUnstakedXRD,

      // methods
      createRRIUrl,
      handleHideToken,
      handleRequestHideToken,
      truncateRRIStringForDisplay,
      verifyHardwareWalletAddress
    }
  }
})

export default WalletOverview
</script>
