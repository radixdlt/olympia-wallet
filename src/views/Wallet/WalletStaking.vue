<template>
  <div class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen overflow-y-scroll">
    <div class="flex-flex-col flex-1">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeForm == 'stake'" @click="() => setForm('stake')">{{ $t('staking.stakeTab') }}</tabs-tab>
        <tabs-tab :isActive="activeForm == 'unstake'" @click="() => setForm('unstake')">{{ $t('staking.unstakeTab') }}</tabs-tab>
      </div>
      <form
        @submit.prevent="handleSubmitStake"
        class="flex flex-col flex-1 mr-6"
      >
        <tabs-content :leftTabIsActive="activeForm == 'stake'">
          <div class="py-6 px-4 text-sm text-rGrayDark border-b border-rGray">{{ stakingDisclaimer }}</div>
          <div class="py-3 px-4 text-sm text-rGrayDark border-b border-rGray">
            <div class="text-rGrayDark mb-3">{{ $t('staking.fromLabel')}}</div>
            <div class="text-rBlack">{{ activeAddress.toString() }}</div>
          </div>
          <div class="pt-3 pb-6 px-4 text-sm border-b border-rGray">
            <div class="text-rGrayDark mb-3">{{ $t('staking.validatorLabel')}}</div>
            <FormField
              name="validator"
              type="text"
              class="w-full"
              :placeholder="$t('staking.validatorPlaceholder')"
              rules="required|validValidator"
            />
            <FormErrorMessage name="validator" class="text-sm text-red-400" />
          </div>
          <div class="pt-3 pb-6 px-4 text-sm">
            <div class="flex flex-row">
              <div class="flex flex-col mr-3 flex-1">
                <div class="text-rGrayDark mb-3">{{ $t('staking.amountLabel')}}</div>
                <FormField
                  name="amount"
                  type="number"
                  step="any"
                  class="w-full text-sm"
                  :placeholder="$t('staking.availableBalancePlaceholder')"
                  rules="required|validAmount"
                />
                <FormErrorMessage name="amount" class="text-sm text-red-400" />
              </div>
              <div class="flex flex-col w-32 ">
                <div class="text-rGrayDark mb-3">{{ $t('staking.feeLabel')}}</div>
                <div class="pt-4 pb-2">0.100</div>
              </div>
            </div>
          </div>
        </tabs-content>

        <ButtonSubmit class="mt-12" :disabled="false">
          {{ stakeButtonCopy }}
        </ButtonSubmit>
      </form>
    </div>

    <div class="bg-white border border-rGray rounded-md flex flex-col overflow-y-scroll w-full h-full max-w-md py-5 px-8">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-medium text-rBlack">{{ $t('staking.currentStakesHeading') }}</h3>
        <a href="https://betanet-explorer.radixdlt.com/#/validators" target="_blank" class="text-rBlue text-sm inline-flex items-center">
          {{ $t('staking.viewAllValidators') }}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-3">
            <path d="M1.08789 1H11.1344V11.0465" stroke="#7A99AC" stroke-miterlimit="10"/>
            <path d="M11.1339 1L1 11.134" stroke="#7A99AC" stroke-miterlimit="10"/>
          </svg>
        </a>
      </div>

      <stake-list-item
        v-for="(stake, i) in activeStakes"
        :key="i"
        :stake="stake"
        :activeUnstakes="activeUnstakes"
        :nativeToken="nativeToken"
        @addToValidator="handleAddToValidator"
        @reduceFromValidator="handleReduceFromValidator"
      >
      </stake-list-item>
    </div>
  </div>
</template>

<script lang="ts">
import { StakePosition, TokenBalance, TokenBalances, UnstakePosition, AccountAddressT, Amount, AmountT, Token } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { safelyUnwrapAmount, safelyUnwrapValidator, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface StakeForm {
  validator: string;
  amount: number;
}

const WalletStaking = defineComponent({
  components: {
    ButtonSubmit,
    FormField,
    FormErrorMessage,
    StakeListItem,
    TabsContent,
    TabsTab
  },

  setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<StakeForm>()
    return { errors, values, meta, setErrors, resetForm }
  },

  props: {
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
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
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: true
    },
    nativeTokenBalance: {
      type: Object as PropType<TokenBalance>,
      required: false
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
    xrdBalance (): AmountT {
      return this.nativeTokenBalance ? this.nativeTokenBalance.amount : Amount.fromUnsafe(0)._unsafeUnwrap()
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
    handleAddToValidator (validator: AccountAddressT) {
      this.activeForm = 'stake'
      this.values.validator = validator.toString()
    },
    handleReduceFromValidator (validator: AccountAddressT) {
      this.activeForm = 'unstake'
      this.values.validator = validator.toString()
    },
    handleSubmitStake () {
      if (this.meta.valid && this.nativeTokenBalance) {
        const safeAddress = safelyUnwrapValidator(this.values.validator)
        const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
        const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
        const validAmount = safeAmount && validateAmountOfType(safeAmount, this.nativeTokenBalance.token)

        if (!greaterThanZero) {
          this.setErrors({
            amount: this.$t('validations.greaterThanZero')
          })
        } else if (!validAmount) {
          this.setErrors({
            amount: this.$t('validations.amountOfType', { granularity: this.nativeTokenBalance.token.granularity.toString() })
          })
        } else {
          this.$emit(this.submitMethod, {
            validator: safeAddress,
            amount: safeAmount
          })
        }
      }
    }
  },

  emits: ['stakeTokens', 'unstakeTokens']
})

export default WalletStaking
</script>
