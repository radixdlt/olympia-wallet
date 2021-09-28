<template>
  <div class="border border-rGray rounded-md divide-rGray">
    <div class="flex flex-row py-1">
      <div class="flex-1 flex flex-row items-center px-6 pt-3 overflow-x-auto justify-between">
        <span class="text-md text-rGrayDark">{{ tokenBalance.tokenIdentifier.name }}</span>
        <div>
          <a :href="rriUrl" target="_blank" class="hover:text-rGreen transition-colors text-rGrayMed">
            <div class="rounded-full border border-solid border-rGray w-6 h-6 flex items-center justify-center ">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.08789 1H11.1344V11.0465" class="stroke-current" stroke-miterlimit="10"/>
                <path d="M11.1339 1L1 11.134" class="stroke-current" stroke-miterlimit="10"/>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div class="overflow-x-scroll relative">
      <div class="flex flex-row absolute">
        <div class="flex-1 flex flex-row items-center px-6 overflow-x-auto">
          <span class="text-sm font-mono text-rGrayDark">{{ truncateRRIStringForDisplay(tokenBalance.tokenIdentifier.toString()) }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy :address="tokenBalance.tokenIdentifier.toString()"/>
          </div>
        </div>
      </div>
      <div class="flex flex-row py-1 mt-6">
        <div class="flex-1 flex flex-row items-center px-6 py-3">
          <big-amount :amount="tokenBalance.amount" class="text-2xl font-light mr-4 text-rBlack" />
          <token-symbol v-if="token">{{ token.symbol.toUpperCase() }}</token-symbol>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref, toRef, Ref } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { SimpleTokenBalance, Token } from '@radixdlt/application'
import { truncateRRIStringForDisplay } from '@/helpers/formatter'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import { firstValueFrom } from 'rxjs'

export default defineComponent({
  components: {
    BigAmount,
    TokenSymbol,
    ClickToCopy
  },

  props: {
    tokenBalance: {
      type: Object as PropType<SimpleTokenBalance>,
      required: true
    },
    explorerUrlBase: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const token: Ref<Token | null> = ref(null)
    const tokenBalance = toRef(props, 'tokenBalance')
    const router = useRouter()
    const { radix } = useWallet(router)

    firstValueFrom(radix.ledger.tokenInfo(tokenBalance.value.tokenIdentifier)).then((t: Token) => {
      token.value = t
    })

    const rriUrl: ComputedRef<string> = computed(() =>
      `${props.explorerUrlBase}/#/tokens/${props.tokenBalance.tokenIdentifier.toString()}`
    )

    return {
      rriUrl,
      truncateRRIStringForDisplay,
      token
    }
  }
})
</script>
