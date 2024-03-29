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
              <div>
                <div v-if="!validator.registered" class="flex justify-start items-center">
                  <span class="bg-rRed w-2 h-2 rounded-full"></span>
                  <span class="text-rRed ml-2 mr-3">{{ $t('staking.unregistered') }}</span>
                </div>
                <div v-if="!inTopOneHundred" class="flex items-center">
                  <span v-if="!inTopOneHundred && !validator.registered"></span>
                  <span class="bg-rRed w-2 h-2 rounded-full"></span>
                  <span class="text-rRed ml-2">{{ $t('staking.notTopOneHundred') }}</span>
                </div>
              </div>
              <a class="relative text-rBlack hover:text-rBlue group underline" v-if="validator.infoURL && validatedValidatorUrl" :href="validator.infoURL" target="__blank"> {{ validator.name }}
                <tooltip>
                  {{$t('staking.validatorWarning')}} {{validator.infoURL.toString()}}
                </tooltip>
              </a>
              <span v-else>{{validator.name}}</span>
            </div>
          </div>
          <div class="text-xs flex items-center text-rGrayDark font-mono group">
            {{ validatorAddressForDisplay }}
            <click-to-copy :address="validatorAddress.toString()" class="group-hover:text-rGreen active:text-rGreenDark" />
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
              {{ validatorUptimeContent }}
            </div>
          </div>
        </dl>
        <dl class="mt-1">
          <div v-if="validateGreaterThanZero(pendingStakeAmount)" class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.pendingStakeLabel') }}:</div>
            <div class="mb-1 flex-1 text-rBlack">
              <big-amount :amount="pendingStakeAmount" />
              <token-symbol
                :symbol="nativeToken.symbol"
                :rri="nativeToken.rri.toString()"
                :hasGreyBackground="false"
              >
              </token-symbol>
            </div>
          </div>
          <div class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.stakedLabel') }}:</div>
            <div class="mb-1 flex-1 text-rBlack">
              <big-amount :amount="stakeAmount" />
              <token-symbol
                :symbol="nativeToken.symbol"
                :rri="nativeToken.rri.toString()"
                :hasGreyBackground="false"
              >
              </token-symbol>
            </div>
          </div>
          <div v-if="validateGreaterThanZero(unstakeAmount)" class="flex items-center flex-wrap">
            <div class="mb-1 w-26 flex-grow-0 text-rGrayMed text-xs">{{ $t('staking.unstakingLabel') }}:</div>
            <div class="mb-1 flex-1 text-rBlack">
              <big-amount :amount="unstakeAmount" />
              <token-symbol
                :symbol="nativeToken.symbol"
                :rri="nativeToken.rri.toString()"
                :hasGreyBackground="false"
              >
              </token-symbol>
            </div>
          </div>
        </dl>
      </div>
      <div class="flex flex-row justify-end mb-px text-rGrayDark text-xs py-2 pr-4 bg-rGrayLightest">
        <button
          class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto mr-px outline-none focus:outline-none px-2"
          @click="$emit('addToValidator', validatorAddress)"
        >
          {{ $t('staking.addButton') }}
        </button>
        /
        <button
          class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto ml-px outline-none focus:outline-none pl-2"
          @click="$emit('reduceFromValidator', validatorAddress)"
        >
          {{ $t('staking.reduceButton') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { AmountT, Token, ValidatorAddressT } from '@radixdlt/application'
import { computed, ComputedRef, defineComponent, PropType, Ref, ref, toRef } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { checkValidatorUrlExploitable } from '@/helpers/explorerLinks'
import { firstValueFrom } from 'rxjs'
import { formatValidatorAddressForDisplay } from '@/helpers/formatter'
import Tooltip from '@/components/Tooltip.vue'
import { useStaking, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { Observed } from '@/helpers/typeHelpers'
import { validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import TokenSymbol from '@/components/TokenSymbol.vue'

const StakeListItem = defineComponent({
  components: {
    BigAmount,
    ClickToCopy,
    TokenSymbol,
    Tooltip
  },

  props: {
    validatorAddress: {
      type: Object as PropType<ValidatorAddressT>,
      required: true
    }
  },

  setup (props) {
    const router = useRouter()
    const { radix, activeNetwork, nativeToken, explorerUrlBase } = useWallet(router)
    if (!activeNetwork.value) return
    const validatorAddress = toRef(props, 'validatorAddress')
    const validator: Ref<Observed<ReturnType<typeof radix.ledger.lookupValidator>> | null> = ref(null)
    const { validatorsTopOneHundred, maybeGetValidator, getActiveStakeAmountForValidator, getPendingStakeAmountForValidator, getUnstakeAmountForValidator } = useStaking(radix, activeNetwork.value)

    // Attempt to get validator from memory before re-fetching
    validator.value = maybeGetValidator(validatorAddress.value)
    if (!validator.value) {
      firstValueFrom(radix.ledger.lookupValidator(validatorAddress.value))
        .then((validatorRes) => { validator.value = validatorRes })
    }

    const explorerUrl: ComputedRef<string> = computed(() =>
      validator.value ? `${explorerUrlBase}/#/validators/${validatorAddress.value.toString()}` : `${explorerUrlBase}/#/validators/`
    )

    const inTopOneHundred: ComputedRef<boolean> = computed(() =>
      validatorsTopOneHundred.value && !!(validatorsTopOneHundred.value.find((v) => v.address.equals(validatorAddress.value)))
    )

    const validatorAddressForDisplay: ComputedRef<string> = computed(() =>
      formatValidatorAddressForDisplay(props.validatorAddress)
    )

    const validatedValidatorUrl: ComputedRef<boolean> = computed(() => {
      if (!validator.value || !validator.value.infoURL) return false
      return checkValidatorUrlExploitable(validator.value.infoURL.toString())
    })

    const validatorUptimeContent: ComputedRef<string> = computed(() => {
      return inTopOneHundred.value && validator.value ? `${validator.value.uptimePercentage}%` : '-'
    })

    const unstakeAmount: ComputedRef<AmountT> = computed(() => getUnstakeAmountForValidator(validatorAddress.value))
    const pendingStakeAmount: ComputedRef<AmountT> = computed(() => getPendingStakeAmountForValidator(validatorAddress.value))
    const stakeAmount: ComputedRef<AmountT> = computed(() => getActiveStakeAmountForValidator(validatorAddress.value))

    return {
      explorerUrl,
      inTopOneHundred,
      pendingStakeAmount,
      nativeToken,
      unstakeAmount,
      validateGreaterThanZero,
      validatorUptimeContent,
      validatedValidatorUrl,
      validator,
      validatorAddressForDisplay,
      stakeAmount
    }
  },

  emits: ['addToValidator', 'reduceFromValidator']
})

export default StakeListItem
</script>
