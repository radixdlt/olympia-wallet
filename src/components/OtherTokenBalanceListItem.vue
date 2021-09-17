<template>
  <div class="border border-rGray rounded-md  divide-rGray">
    <div class="flex flex-row py-1">
      <div class="flex-1 flex flex-row items-center px-6 pt-3 overflow-x-auto justify-between">
        <span class="text-sm text-rGrayDark">{{ tokenBalance.token.name }}</span>
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
    <div class="overflow-x-scroll">
      <div class="flex flex-row absolute">
        <div class="flex-1 flex flex-row items-center px-6 pt-3 overflow-x-auto">
          <span class="text-sm font-mono text-rGrayDark">{{ truncateRRIStringForDisplay(tokenBalance.token.rri.toString()) }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy :address="tokenBalance.token.rri.toString()"/>
          </div>
        </div>
      </div>
      <div class="flex flex-row py-1 mt-8">
        <div class="flex-1 flex flex-row items-center px-6 py-3">
          <big-amount :amount="tokenBalance.amount" class="text-5xl font-light mr-4 text-rBlack" />
          <token-symbol class="mt-3">{{ tokenBalance.token.symbol.toUpperCase() }}</token-symbol>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import TokenSymbol from '@/components/TokenSymbol.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { TokenBalance } from '@radixdlt/application'
import { truncateRRIStringForDisplay } from '@/helpers/formatter'

export default defineComponent({
  components: {
    BigAmount,
    TokenSymbol,
    ClickToCopy
  },

  props: {
    tokenBalance: {
      type: Object as PropType<TokenBalance>,
      required: true
    },
    explorerUrlBase: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const rriUrl: ComputedRef<string> = computed(() =>
      `${props.explorerUrlBase}/#/tokens/${props.tokenBalance.token.rri.toString()}`
    )

    return {
      rriUrl,
      truncateRRIStringForDisplay
    }
  }
})
</script>