<template>
  <div class="border border-rGray rounded-md mb-4 text-rBlack">
    <div class="">
      <div class="flex px-4 pt-3 pb-1">
        <div class="flex-grow">
          <div
            v-if="validator"
            class="text-sm flex items-center"
          >
            <div class="flex flex-col">
              <div v-if="!validator.registered" class="inline-flex justify-start items-center">
                <span class="bg-rRed w-2 h-2 rounded-full"></span>
                <span class="text-rRed ml-2">unregistered</span>
              </div>
              <a class="relative text-rBlack hover:text-rBlue group" v-if="validator.infoURL" :href="validator.infoURL" target="__blank"> {{ validator.name }}
                <tooltip>
                  {{$t('staking.validatorWarning')}} {{validator.infoURL.toString()}}
                </tooltip>
              </a>
              <span v-else>{{validator.name}}</span>
            </div>
          </div>
          <div class="text-xs flex items-center text-rGrayDark font-mono group">
            {{ validatorAddress }}
            <click-to-copy :address="position.address" class="group-hover:text-rGreen active:text-rGreenDark" />
          </div>
        </div>
        <div class="flex-grow-0">
          <a :href="explorerUrl" target="_blank" class="hover:text-rGreen transition-colors text-rGrayMed">
            <div class="rounded-full border border-solid border-rGray w-6 h-6 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.08789 1H11.1344V11.0465" class="stroke-current" stroke-miterlimit="10"/>
                <path d="M11.1339 1L1 11.134" class="stroke-current" stroke-miterlimit="10"/>
              </svg>
            </div>
          </a>
        </div>
      </div>
      <div v-if="validator" class="text-sm mx-4">
        <dl class="border-b border-rGray">
          <div class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.validatorFeeLabel') }}:</div>
            <div class="mb-1 flex-1 text-rBlack">+{{validator.validatorFee}}%</div>
          </div>
          <div class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.recentUptimeLabel') }}:</div>
            <div
              class="mb-1 flex-1 text-rBlack"
              :class="{'text-rRed': Number(validator.uptimePercentage) <= 98}"
            >
              {{validator.uptimePercentage}}%
            </div>
          </div>
        </dl>
        <dl class="mt-1">
          <div class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.stakedLabel') }}:</div>
            <div class="mb-1 flex-1 text-rBlack"><big-amount :amount="stakeAmount" /> <span class="text-rGrayDark ml-1 uppercase">{{ nativeToken.symbol }}</span></div>
          </div>
          <div class="flex items-center flex-wrap">
            <div v-if="unstakeAmount" class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.unstakingLabel') }}:</div>
            <div v-if="unstakeAmount" class="mb-1 flex-1 text-rBlack"><big-amount :amount="unstakeAmount" /> <span class="text-rGrayDark ml-1 uppercase">{{ nativeToken.symbol }}</span></div>
          </div>
        </dl>
      </div>
      <div class="flex flex-row justify-end mb-px text-rGrayDark text-xs py-2 pr-4 bg-rGrayLightest">
        <button
          class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto mr-px outline-none focus:outline-none px-2"
          @click="$emit('addToValidator', position.validator)"
        >
          {{ $t('staking.addButton') }}
        </button>
        /
        <button
          class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto ml-px outline-none focus:outline-none pl-2"
          @click="$emit('reduceFromValidator', position.validator)"
        >
          {{ $t('staking.reduceButton') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Token, UnstakePosition, Validator, Amount, AmountT, StakePosition } from '@radixdlt/application'
import { computed, ComputedRef, defineComponent, PropType, Ref, ref, toRef } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { firstValueFrom } from 'rxjs'
import { formatValidatorAddressForDisplay } from '@/helpers/formatter'
import { Position } from '@/services/_types'
import Tooltip from '@/components/Tooltip.vue'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'

const StakeListItem = defineComponent({
  components: {
    BigAmount,
    ClickToCopy,
    Tooltip
  },

  props: {
    position: {
      type: Object as PropType<Position>,
      required: true
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: true
    },
    explorerUrlBase: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const validator: Ref<Validator | null> = ref(null)
    const router = useRouter()
    const { radix } = useWallet(router)

    const position = toRef(props, 'position')

    firstValueFrom(radix.ledger.lookupValidator(position.value.validator)).then((validatorRes: Validator) => { validator.value = validatorRes })

    const explorerUrl: ComputedRef<string> = computed(() =>
      validator.value ? `${props.explorerUrlBase}/#/validators/${validator.value.address.toString()}` : `${props.explorerUrlBase}/#/validators/`
    )

    return {
      validator,
      explorerUrl
    }
  },

  computed: {
    validatorAddress (): string {
      return formatValidatorAddressForDisplay(this.position.validator)
    },
    unstakesForValidator (): UnstakePosition[] {
      return this.position.unstakes
    },

    stakeAmount (): AmountT {
      const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
      if (this.position.stakes.length === 0) { return zero }
      return this.position.stakes.map((el: StakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr), zero)
    },

    unstakeAmount (): AmountT | null {
      const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
      if (this.position.unstakes.length === 0) { return null }
      return this.position.unstakes.map((el: UnstakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr), zero)
    }
  },

  emits: ['addToValidator', 'reduceFromValidator']
})

export default StakeListItem
</script>
