<template>
  <div v-if="tokenBalance" class="border border-rGray rounded-md p-6 mb-5 flex flex-row items-center justify-between">
    <div class="flex flex-row items-center flex-1">
      <BigAmount :amount="tokenBalance.value" class="text-4xl font-light mr-4 text-rBlack" />
      <token-symbol
        v-if="token"
        :symbol="token.symbol.toUpperCase()"
        :rri="token.rri.toString()"
        :hasGreyBackground="true"
      >
      </token-symbol>
    </div>

    <AppButtonIcon
      v-if="token"
      @click="$emit('select', token)"
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="pointer-events-none mr-1.5 w-5">
        <path d="M1.8501 7.10002L1.40288 6.87642C1.3325 7.01718 1.3325 7.18287 1.40288 7.32363L1.8501 7.10002ZM1.8501 7.10002C1.40288 6.87642 1.40297 6.87624 1.40307 6.87605L1.40331 6.87557L1.40398 6.87424L1.40603 6.87017L1.41302 6.85649C1.41896 6.84495 1.42745 6.8286 1.43847 6.80777C1.46051 6.76611 1.49271 6.70648 1.53492 6.63146C1.61928 6.48147 1.74385 6.26953 1.90742 6.01626C2.23394 5.51068 2.71914 4.83532 3.35408 4.15805C4.61484 2.81324 6.52534 1.40002 9.0001 1.40002C11.4749 1.40002 13.3854 2.81324 14.6461 4.15805C15.2811 4.83532 15.7663 5.51068 16.0928 6.01626C16.2563 6.26953 16.3809 6.48147 16.4653 6.63146C16.5075 6.70648 16.5397 6.76611 16.5617 6.80777C16.5727 6.8286 16.5812 6.84495 16.5872 6.85649L16.5942 6.87017L16.5962 6.87424L16.5969 6.87557L16.5971 6.87605C16.5972 6.87624 16.5973 6.87642 16.1501 7.10002M1.8501 7.10002C1.40288 7.32363 1.40297 7.3238 1.40307 7.324L1.40331 7.32448L1.40398 7.32581L1.40603 7.32987L1.41302 7.34355C1.41896 7.3551 1.42745 7.37145 1.43847 7.39228C1.46051 7.43394 1.49271 7.49357 1.53492 7.56859C1.61928 7.71858 1.74385 7.93052 1.90742 8.18379C2.23394 8.68937 2.71914 9.36473 3.35408 10.042C4.61484 11.3868 6.52534 12.8 9.0001 12.8C11.4749 12.8 13.3854 11.3868 14.6461 10.042C15.2811 9.36473 15.7663 8.68937 16.0928 8.18379C16.2563 7.93052 16.3809 7.71858 16.4653 7.56859C16.5075 7.49357 16.5397 7.43394 16.5617 7.39228C16.5727 7.37145 16.5812 7.3551 16.5872 7.34355L16.5942 7.32987L16.5962 7.32581L16.5969 7.32448L16.5971 7.324C16.5972 7.3238 16.5973 7.32363 16.1501 7.10002M16.1501 7.10002L16.5973 6.87642C16.6677 7.01718 16.6677 7.18287 16.5973 7.32363L16.1501 7.10002Z" class="stroke-current" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.00011 9.55002C10.3532 9.55002 11.4501 8.45312 11.4501 7.10002C11.4501 5.74693 10.3532 4.65002 9.00011 4.65002C7.64701 4.65002 6.55011 5.74693 6.55011 7.10002C6.55011 8.45312 7.64701 9.55002 9.00011 9.55002Z" class="stroke-current" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      {{ $t('settings.unhideTokenButton')}}
    </AppButtonIcon>
  </div>
</template>

<script lang="ts">
import { Token } from '@radixdlt/application'
import { defineComponent, PropType, Ref, ref, toRef } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import AppButtonIcon from '@/components/AppButtonIcon.vue'
import { useRouter } from 'vue-router'
import { useTokenBalances, useWallet } from '@/composables'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'

export default defineComponent({
  components: {
    AppButtonIcon,
    BigAmount,
    TokenSymbol
  },

  props: {
    tokenRRI: {
      type: String,
      required: true
    },
    tokenBalance: {
      type: Object as PropType<Decoded.TokenAmount | null>,
      required: true
    }
  },

  setup (props) {
    const router = useRouter()
    const { radix } = useWallet(router)
    const tokenBalance = toRef(props, 'tokenBalance')
    const token: Ref<Token | null> = ref(null)
    const { tokenInfoFor } = useTokenBalances(radix)

    if (tokenBalance.value) {
      token.value = tokenInfoFor(tokenBalance.value.token_identifier.rri)
    }

    return {
      token
    }
  },

  emits: ['select']
})
</script>
