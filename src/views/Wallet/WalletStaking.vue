<template>
  <div class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen overflow-y-auto">
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
          <div class="py-4 px-4 text-sm text-rGrayDark border-b border-rGray">
            <div v-if="activeForm == 'stake'">
              <i18n-t keypath="staking.stakeDisclaimer" tag="p">
                <template #link>
                  <a :href="stakeUrl" target="_blank" class="underline text-rBlack">{{$t('staking.guideTitle')}}</a>
                </template>
                <template #bold>
                  <b class="font-medium text-rBlack">{{$t('staking.stakeDisclaimerBold')}}</b>
                </template>
              </i18n-t>
            </div>
            <div v-else>
              <i18n-t keypath="staking.unstakeDisclaimer" tag="p">
                <template #link>
                  <a :href="stakeUrl" target="_blank" class="underline text-rBlack">{{$t('staking.guideTitle')}}</a>
                </template>
                <template #bold>
                  <b class="font-medium text-rBlack">{{$t('staking.unstakeDisclaimerBold')}}</b>
                </template>
              </i18n-t>
            </div>
          </div>
          <div class="py-3 px-4 text-sm text-rGrayDark border-b border-rGray">
            <div class="text-rGrayDark mb-2">{{ $t('staking.fromLabel')}}</div>
            <div class="text-rBlack font-mono">{{ activeAddress.toString() }}</div>
          </div>
          <div class="pt-3 pb-6 px-4 text-sm border-b border-rGray">
            <div class="text-rGrayDark mb-2">{{ $t('staking.validatorLabel')}}</div>
            <FormField
              name="validator"
              type="text"
              class="w-full text-sm font-mono placeholder-sans"
              :placeholder="$t('staking.validatorPlaceholder')"
              rules="required|validValidator"
            />
            <FormErrorMessage name="validator" class="text-sm text-red-400" />
          </div>
          <div class="pt-3 pb-8 px-4 text-sm">
            <div class="flex flex-row">
              <div class="flex flex-col mr-3 flex-1">
                <div class="text-rGrayDark mb-3">{{ $t('staking.amountLabel')}}</div>
                <FormField
                  name="amount"
                  type="number"
                  step="any"
                  class="w-full text-sm"
                  :placeholder="amountPlaceholder"
                  rules="required|validAmount"
                />
                <FormErrorMessage name="amount" class="text-sm text-red-400" errorClass="w-120" />
              </div>
            </div>
          </div>
        </tabs-content>

        <ButtonSubmit class="mt-4" :disabled="disableSubmit">
          {{ stakeButtonCopy }}
        </ButtonSubmit>
      </form>
    </div>

    <div class="bg-white border border-rGray rounded-md flex flex-col overflow-y-auto w-full h-full max-w-md py-5 px-8">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-medium text-rBlack">{{ $t('staking.currentStakesHeading') }}</h3>
        <a :href="explorerUrl" target="_blank" class="text-rBlue text-sm inline-flex items-center">
          {{ $t('staking.viewAllValidators') }}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-3">
            <path d="M1.08789 1H11.1344V11.0465" stroke="#7A99AC" stroke-miterlimit="10"/>
            <path d="M11.1339 1L1 11.134" stroke="#7A99AC" stroke-miterlimit="10"/>
          </svg>
        </a>
      </div>

      <stake-list-item
        v-for="(position, i) in sortedPositions"
        :key="i"
        :position="position"
        :nativeToken="nativeToken"
        @addToValidator="handleAddToValidator"
        @reduceFromValidator="handleReduceFromValidator"
      >
      </stake-list-item>
    </div>
  </div>
</template>

<script lang="ts">
import { StakePosition, TokenBalance, TokenBalances, UnstakePosition, AccountAddressT, Amount, AmountT, Token, ValidatorAddressT, TransactionIdentifierT, Validator } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { safelyUnwrapAmount, safelyUnwrapValidator, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { asBigNumber } from '@/components/BigAmount.vue'
import { Position } from '@/store/_types'

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
      activeForm: 'stake',
      stakeUrl: 'https://learn.radixdlt.com'
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
    },
    sortedPositions (): Array<Position> {
      // If more than 1 stake exists for the same validator, only display the validator once and sum their amounts
      let positions: Position[] = []

      this.activeStakes.forEach((stake: StakePosition) => {
        const existingPositionIndex = positions.findIndex((pos: Position) => pos.validator.equals(stake.validator))
        if (existingPositionIndex === -1) {
          positions = [...positions, { validator: stake.validator, stakes: [stake], unstakes: [] }]
        } else {
          positions[existingPositionIndex] = { ...positions[existingPositionIndex], stakes: [...positions[existingPositionIndex].stakes, stake] }
        }
      })

      this.activeUnstakes.forEach((unstake: UnstakePosition) => {
        const existingPositionIndex = positions.findIndex((pos: Position) => pos.validator.equals(unstake.validator))
        if (existingPositionIndex === -1) {
          positions = [...positions, { validator: unstake.validator, unstakes: [unstake], stakes: [] }]
        } else {
          positions[existingPositionIndex] = { ...positions[existingPositionIndex], unstakes: [...positions[existingPositionIndex].unstakes, unstake] }
        }
      })

      return positions.sort((a: Position, b: Position) => {
        const aTotal = a.stakes.map((el: StakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr))
        const bTotal = b.stakes.map((el: StakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr))
        if (aTotal > bTotal) return -1
        if (bTotal > aTotal) return 1
        return 0
      })
    },
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    },
    amountPlaceholder (): string {
      if (this.xrdBalance && this.activeForm === 'stake') {
        return `${this.$t('staking.amountPlaceholder')} ${asBigNumber(this.xrdBalance)} `
      }

      return this.$t('staking.availableBalancePlaceholder')
    },
    explorerUrl (): string {
      return `${process.env.VUE_APP_EXPLORER}/#/validators`
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
    validAmountForValidator (amount: AmountT, validator: ValidatorAddressT | null, method: string) {
      if (method === 'stakeTokens') {
        return true
      } else {
        if (!validator) return false
        const stakedValidator = this.activeStakes.find(stake => stake.validator.toString() === validator.toString())
        if (!stakedValidator) return false
        if (amount > stakedValidator.amount) return false
        return true
      }
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
