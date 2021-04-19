<template>
  <div class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen">
    <div class="flex-flex-col flex-1">
      <div class="flex flex-row">
        <div
          class="w-40 flex items-center justify-center py-5 -mb-px relative z-20 cursor-pointer"
          :class="{'bg-white border-t border-r border-l border-rGray rounded-t-md': activeForm == 'stake'}"
          @click="() => setForm('stake')"
        >
          {{ $t('staking.stakeTab') }}
        </div>
        <div
          class="w-40 flex items-center justify-center py-5 -mb-px relative z-20 cursor-pointer"
          :class="{'bg-white border-t border-r border-l border-rGray rounded-t-md': activeForm == 'unstake'}"
          @click="() => setForm('unstake')"
        >
          {{ $t('staking.unstakeTab') }}
        </div>
      </div>
      <form
        @submit.prevent="handleSubmitStake"
        class="flex flex-col flex-1 mr-6"
      >
        <div
          class="bg-white border border-rGray flex flex-col w-full"
          :class="{'rounded-b-md rounded-r-md': activeForm == 'stake', 'rounded-md': activeForm == 'unstake'}"
        >
          <div class="py-6 px-4 text-sm text-rGrayDark border-b border-rGray">{{ stakingDisclaimer }}</div>
          <div class="py-3 px-4 text-sm text-rGrayDark border-b border-rGray">
            <div class="text-rGrayDark mb-3">{{ $t('staking.fromLabel')}}</div>
            <div class="text-rBlack">{{ activeAddress.toString() }}</div>
          </div>
          <div class="py-3 px-4 text-sm border-b border-rGray">
            <div class="text-rGrayDark mb-3">{{ $t('staking.validatorLabel')}}</div>
            <Field
              name="validator"
              class="w-full border-b border-rBlack leading-8 focus:ring-0 focus:outline-none focus:border-rGreen"
              :placeholder="$t('staking.validatorPlaceholder')"
              rules="required|validAddress"
            ></Field>
            <ErrorMessage name="validator" class="mt-4 text-sm text-red-400" />
          </div>
          <div class="py-3 px-4 text-sm">
            <div class="flex flex-row">
              <div class="flex flex-col mr-3 flex-1">
                <div class="text-rGrayDark mb-3">{{ $t('staking.amountLabel')}}</div>
                <Field
                  name="amount"
                  type="number"
                  step="any"
                  class="w-full border-t-0 border-r-0 border-l-0 p-0 border-b border-rBlack leading-8 focus:ring-0 focus:outline-none focus:border-rGreen text-sm"
                  :placeholder="amountPlaceholder"
                  rules="required|validAmount"
                ></Field>
                <ErrorMessage name="amount" class="mt-4 text-sm text-red-400" />
              </div>
              <div class="flex flex-col w-32 justify-between">
                <div class="text-rGrayDark mb-3">{{ $t('staking.feeLabel')}}</div>
                <div class="pb-2">0.000</div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center px-6 py-4 border font-normal leading-snug rounded w-full mt-12 transition-colors bg-rGreen border-rGreen text-white"
        >
          {{ stakeButtonCopy }}
        </button>
      </form>
    </div>

    <div class="bg-white border border-rGray rounded-md flex flex-col overflow-y-scroll w-full h-full max-w-md py-5 px-8">
      <h3 class="font-medium text-rBlack mb-5">{{ $t('staking.currentStakesHeading') }}</h3>

      <stake-list-item
        v-for="(stake, i) in activeStakes"
        :key="i"
        :stake="stake"
        :unstaking="false"
        @addToValidator="handleAddToValidator"
        @reduceFromValidator="handleReduceFromValidator"
      >
      </stake-list-item>

      <stake-list-item
        v-for="(stake, i) in activeUnstakes"
        :key="i"
        :stake="stake"
        :unstaking="true"
        @addToValidator="handleAddToValidator"
        @reduceFromValidator="handleReduceFromValidator"
      >
      </stake-list-item>
    </div>
  </div>
</template>

<script lang="ts">
import { AddressT } from '@radixdlt/account'
import { StakePosition, TokenBalance, TokenBalances, UnstakePosition } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { Amount, AmountT, Denomination } from '@radixdlt/primitives'
import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType } from '@/helpers/validateRadixTypes'

interface StakeForm {
  validator: string;
  amount: number;
}

const WalletStaking = defineComponent({
  components: {
    ErrorMessage,
    Field,
    StakeListItem
  },

  setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<StakeForm>()
    return { errors, values, meta, setErrors, resetForm }
  },

  props: {
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    },
    activeStakes: {
      type: Array as PropType<Array<StakePosition>>,
      required: true
    },
    activeUnstakes: {
      type: Object as PropType<Array<UnstakePosition>>,
      required: true
    },
    tokenBalances: {
      type: Object as PropType<TokenBalances>,
      required: true
    }
  },

  data () {
    return {
      activeForm: 'stake'
    }
  },

  computed: {
    stakingDisclaimer (): string {
      return this.activeForm === 'stake' ? this.$t('staking.stakeDisclaimer') : this.$t('staking.unstakeDisclaimer')
    },
    xrdToken (): TokenBalance | null {
      if (this.tokenBalances.tokenBalances && this.tokenBalances.tokenBalances.length > 0) {
        return this.tokenBalances.tokenBalances.find((tb: TokenBalance) => tb.token.symbol === 'XRD') || null
      }
      return null
    },
    xrdBalance (): AmountT {
      if (this.tokenBalances.tokenBalances &&
        this.tokenBalances.tokenBalances.length > 0 &&
        this.tokenBalances.tokenBalances.find((tb: TokenBalance) => tb.token.symbol === 'XRD')
      ) {
        const xrdBalance = this.tokenBalances.tokenBalances.find((tb: TokenBalance) => tb.token.symbol === 'XRD')
        return xrdBalance ? xrdBalance.amount : Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
      } else return Amount.fromUnsafe(0, Denomination.Whole)._unsafeUnwrap()
    },
    amountPlaceholder (): string {
      const availableBalanceForCurrency = this.xrdBalance.toString()
      return `${this.$t('staking.availableBalancePlaceholder')} ${availableBalanceForCurrency} `
    },
    submitMethod (): 'stakeTokens' | 'unstakeTokens' {
      return this.activeForm === 'stake' ? 'stakeTokens' : 'unstakeTokens'
    },
    stakeButtonCopy (): string {
      return this.activeForm === 'stake' ? this.$t('staking.stakeButton') : this.$t('staking.unstakeButton')
    }
  },

  methods: {
    setForm (form: string) {
      this.activeForm = form
      this.resetForm()
    },
    handleAddToValidator (validator: AddressT) {
      this.activeForm = 'stake'
      this.values.validator = validator.toString()
    },
    handleReduceFromValidator (validator: AddressT) {
      this.activeForm = 'unstake'
      this.values.validator = validator.toString()
    },
    handleSubmitStake () {
      if (this.meta.valid && this.xrdToken) {
        const safeAddress = safelyUnwrapAddress(this.values.validator)
        const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
        const validAmount = safeAmount && validateAmountOfType(safeAmount, this.xrdToken.token)

        if (validAmount) {
          this.$emit(this.submitMethod, {
            validator: safeAddress,
            amount: safeAmount
          })
        } else {
          this.setErrors({
            amount: this.$t('validations.amountOfType', { granularity: this.xrdToken.token.granularity.toString() })
          })
        }
      }
    }
  },

  emits: ['stakeTokens', 'unstakeTokens']
})

export default WalletStaking
</script>