<template>
  <div class="p-6">
    <div v-if="loading" class="p-4 flex items-center justify-center">
      <LoadingIcon class="text-rGrayDark" />
    </div>
    <template v-else-if="tokenBalances && tokenBalances.account_balances.liquid_balances.length > 0 && hiddenTokens.length > 0">
      <div class="text-rGrayDark text-sm max-w-lg mb-8">{{ $t('settings.tokensDescription') }}</div>

      <HiddenTokenBalanceListItem
        v-for="token in tokenBalanceOfHidden"
        :key="token.token_identifier.rri.toString()"
        :tokenRRI="token.token_identifier.rri.toString()"
        :tokenBalance="tokenBalanceForByString(token.token_identifier.rri.toString())"
        @select="handleRequestUnhideToken"
      />
    </template>
    <template v-else>
      <div class="text-rGrayDark text-sm max-w-lg mb-8">{{ $t('settings.emptyTokensDescription') }}</div>

      <div class="border border-rGray rounded-md w-full h-24"></div>
    </template>

    <AppModal
      :visible="!!tokenToUnhide"
      :title="$t('settings.unhideTokenBalanceModalTitle')"
    >
      <template v-slot:icon>
        <svg width="54" height="40" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.40991 20L1.74028 19.6622C1.63312 19.8746 1.63312 20.1253 1.74028 20.3377L2.40991 20ZM2.40991 20C1.74028 19.6622 1.74043 19.6619 1.74061 19.6615L1.74115 19.6605L1.74285 19.6571L1.74871 19.6456L1.77026 19.6038C1.78899 19.5677 1.81643 19.5153 1.85253 19.4477C1.92471 19.3125 2.03151 19.1164 2.1724 18.8681C2.45412 18.3716 2.87246 17.6659 3.42318 16.8207C4.52368 15.1316 6.15763 12.8777 8.29193 10.621C12.5473 6.12158 18.8787 1.52271 26.9999 1.52271C35.121 1.52271 41.4524 6.12158 45.7078 10.621C47.8421 12.8777 49.476 15.1316 50.5765 16.8207C51.1272 17.6659 51.5456 18.3716 51.8273 18.8681C51.9682 19.1164 52.075 19.3125 52.1472 19.4477C52.1833 19.5153 52.2107 19.5677 52.2295 19.6038L52.251 19.6456L52.2569 19.6571L52.2586 19.6605L52.2591 19.6615C52.2593 19.6619 52.2594 19.6622 51.5898 20M2.40991 20C1.74028 20.3377 1.74043 20.338 1.74061 20.3384L1.74115 20.3395L1.74285 20.3428L1.74871 20.3543L1.77026 20.3961C1.78899 20.4322 1.81643 20.4846 1.85253 20.5523C1.92471 20.6875 2.03151 20.8836 2.1724 21.1318C2.45412 21.6283 2.87246 22.334 3.42318 23.1793C4.52368 24.8684 6.15763 27.1223 8.29193 29.379C12.5473 33.8784 18.8787 38.4772 26.9999 38.4772C35.121 38.4772 41.4524 33.8784 45.7078 29.379C47.8421 27.1223 49.476 24.8684 50.5765 23.1793C51.1272 22.334 51.5456 21.6283 51.8273 21.1318C51.9682 20.8836 52.075 20.6875 52.1472 20.5523C52.1833 20.4846 52.2107 20.4322 52.2295 20.3961L52.251 20.3543L52.2569 20.3428L52.2586 20.3395L52.2591 20.3384C52.2593 20.338 52.2594 20.3377 51.5898 20M51.5898 20L52.2594 19.6622C52.3666 19.8746 52.3666 20.1253 52.2594 20.3377L51.5898 20Z" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M27 29.75C32.3848 29.75 36.75 25.3848 36.75 20C36.75 14.6152 32.3848 10.25 27 10.25C21.6152 10.25 17.25 14.6152 17.25 20C17.25 25.3848 21.6152 29.75 27 29.75Z" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
      <template v-slot:content>
        <p class="mb-5">{{ $t('settings.confirmUnhideToken', { tokenName: tokenToUnhide ? tokenToUnhide.name : 'emunie' }) }}</p>
        <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel class="w-44" @click="tokenToUnhide = ''">{{ $t('general.cancel') }}</AppButtonCancel>
        <AppButtonSubmit class="w-44" @click="handleUnhideToken">{{ $t('settings.unhideBalanceSubmit') }}</AppButtonSubmit>
      </div>
      </template>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { getHiddenTokens, unhideTokenType } from '@/actions/vue/data-store'
import { defineComponent, onMounted, onUnmounted, Ref, computed, ComputedRef, ref, PropType, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppButtonSubmit from '@/components/AppButtonSubmit.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import HiddenTokenBalanceListItem from '@/components/HiddenTokenBalanceListItem.vue'
import { useRouter } from 'vue-router'
import { useTokenBalances, useWallet, useHistory } from '@/composables'
import { AccountT, Token } from '@radixdlt/application'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'

export default defineComponent({
  components: {
    AppButtonCancel,
    AppButtonSubmit,
    AppModal,
    HiddenTokenBalanceListItem,
    LoadingIcon
  },

  props: {
    activeAccount: {
      type: Object as PropType<AccountT>,
      required: true
    }
  },

  setup () {
    const hiddenTokens: Ref<string[]> = ref([])
    const tokenToUnhide: Ref<Token | null> = ref(null)
    const loading: Ref<boolean> = ref(true)
    const router = useRouter()
    const { activeAddress, activeAccount, radix } = useWallet(router)
    const { fetchBalancesForAddress, tokenBalances, tokenBalancesUnsub, tokenBalanceForByString } = useTokenBalances(radix)
    if (!activeAccount.value) {
      return
    }

    onMounted(() => {
      getHiddenTokens().then((res) => {
        hiddenTokens.value = res
        loading.value = false
      })
    })

    watch((activeAddress), (newActiveAddress) => {
      newActiveAddress && fetchBalancesForAddress(newActiveAddress)
    })

    onUnmounted(() => { tokenBalancesUnsub() })

    const handleRequestUnhideToken = (token: Token) => {
      tokenToUnhide.value = token
    }

    const handleUnhideToken = () => {
      if (tokenToUnhide.value) {
        unhideTokenType(tokenToUnhide.value.rri.toString()).then((res: string[]) => { hiddenTokens.value = res })
        tokenToUnhide.value = null
      }
    }

    const tokenBalanceOfHidden: ComputedRef<Decoded.TokenAmount[] | null> = computed(() => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.account_balances.liquid_balances.filter(lb => hiddenTokens.value.includes(lb.token_identifier.rri.toString()))
    })

    return {
      hiddenTokens,
      loading,
      tokenBalances,
      tokenToUnhide,
      tokenBalanceOfHidden,

      // methods
      handleRequestUnhideToken,
      handleUnhideToken,
      tokenBalanceForByString
    }
  }
})
</script>
