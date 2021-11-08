<template>
  <div class="border border-rGray rounded-md divide-rGray">
    <div class="flex flex-row py-1">
      <div class="flex-1 flex flex-row items-center px-6 pt-3 overflow-x-auto justify-between">
        <span class="text-md text-rGrayDark" v-if="token">{{ token.name }}</span>
        <div class="flex items-center gap-3">
          <button
            class="text-rGrayDark hover:text-rGreen transition-colors focus:outline-none"
            @click="$emit('hideToken', token)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="pointer-events-none mr-1.5 w-5">
              <path d="M5.75909 2.41454C6.16583 2.31933 6.58226 2.27174 7 2.27272C11.1364 2.27272 13.5 6.99999 13.5 6.99999C13.1413 7.67103 12.7135 8.30279 12.2236 8.88499M10.51 10.51C9.49989 11.2799 8.26993 11.7065 7 11.7273C2.86364 11.7273 0.5 6.99999 0.5 6.99999C1.23503 5.6302 2.25449 4.43344 3.49 3.48999L10.51 10.51Z" class="stroke-current" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M0.5 0.5L13.5 13.5" class="stroke-current" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.76777 8.76771C8.53562 8.99986 8.26002 9.18401 7.95671 9.30964C7.65339 9.43528 7.3283 9.49995 7 9.49995C6.6717 9.49995 6.34661 9.43528 6.04329 9.30964C5.73998 9.18401 5.46438 8.99986 5.23223 8.76771C5.00009 8.53557 4.81594 8.25997 4.6903 7.95665C4.56466 7.65334 4.5 7.32825 4.5 6.99994C4.5 6.67164 4.56466 6.34655 4.6903 6.04324C4.81594 5.73992 5.00009 5.46432 5.23223 5.23218" class="stroke-current"/>
              <path d="M6.4314 4.5655C6.84303 4.46937 7.27232 4.47919 7.67913 4.59404C8.08594 4.70888 8.45698 4.925 8.75758 5.22219C9.05818 5.51939 9.27851 5.88795 9.39798 6.29342C9.51745 6.6989 9.53216 7.12805 9.44073 7.54075" class="stroke-current" stroke-linecap="round"/>
            </svg>
          </button>
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
    ClickToCopy,
    TokenSymbol
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
      token,

      // methods
      truncateRRIStringForDisplay
    }
  },

  emits: ['hideToken']
})
</script>
