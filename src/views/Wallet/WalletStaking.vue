<template>
  <div v-if=true class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen">
    Staking & Unstaking Coming Soon
  </div>
  <div v-if=false class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen overflow-y-scroll">
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
          <div class="py-3 px-4 text-sm border-b border-rGray">
            <div class="text-rGrayDark mb-3">{{ $t('staking.validatorLabel')}}</div>
            <FormField
              name="validator"
              type="text"
              class="w-full"
              :placeholder="$t('staking.validatorPlaceholder')"
              rules="required|validAddress"
            />
            <FormErrorMessage name="validator" class="mt-4 text-sm text-red-400" />
          </div>
          <div class="py-3 px-4 text-sm">
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
                <FormErrorMessage name="amount" class="mt-4 text-sm text-red-400" />
              </div>
              <div class="flex flex-col w-32 ">
                <div class="text-rGrayDark mb-3">{{ $t('staking.feeLabel')}}</div>
                <div class="pt-4 pb-2">0.000</div>
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
import { AccountAddressT } from '@radixdlt/account'
import { StakePosition, TokenBalance, TokenBalances, UnstakePosition } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { Amount, AmountT } from '@radixdlt/primitives'
import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType } from '@/helpers/validateRadixTypes'
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
        return xrdBalance ? xrdBalance.amount : Amount.fromUnsafe(0)._unsafeUnwrap()
      } else return Amount.fromUnsafe(0)._unsafeUnwrap()
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
    handleAddToValidator (validator: AccountAddressT) {
      this.activeForm = 'stake'
      this.values.validator = validator.toString()
    },
    handleReduceFromValidator (validator: AccountAddressT) {
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
