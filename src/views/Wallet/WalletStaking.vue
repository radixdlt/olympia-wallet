<template>
  <div class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen overflow-y-auto">
    <div v-if="!loadedAllData" class="p-4 flex items-center justify-center flex-1 h-32">
      <loading-icon class="text-rGrayDark" />
    </div>
    <div v-else-if="!hasTokenBalances" class="p-4 flex-1">
      {{ $t('transaction.insufficientFunds') }}
    </div>
    <div v-else class="flex-flex-col flex-1">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeForm == 'STAKING'" @click="() => setForm('STAKING')">{{ $t('staking.stakeTab') }}</tabs-tab>
        <tabs-tab :isActive="activeForm == 'UNSTAKING'" @click="() => setForm('UNSTAKING')">{{ $t('staking.unstakeTab') }}</tabs-tab>
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

    <div class="bg-white border border-rGray rounded-md flex flex-col overflow-y-auto w-full h-full max-w-md p-4">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-medium text-rBlack">{{ $t('staking.currentStakesHeading') }}</h3>
        <a :href="explorerUrl" target="_blank" class="text-rBlue text-sm inline-flex items-center">
          {{ $t('staking.viewAllValidators') }}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-1">
            <path d="M1.08789 1H11.1344V11.0465" stroke="#7A99AC" stroke-miterlimit="10"/>
            <path d="M11.1339 1L1 11.134" stroke="#7A99AC" stroke-miterlimit="10"/>
          </svg>
        </a>
      </div>
      <div v-if="loadingAnyStaking || !nativeToken" class="p-4 flex items-center justify-center">
        <loading-icon class="text-rGrayDark" />
      </div>
      <template v-else>
        <stake-list-item
          v-for="(v) in relatedValidators"
          :key="v.toString()"
          :validatorAddress="v"
          :nativeToken="nativeToken"
          :explorerUrlBase="explorerUrlBase"
          @addToValidator="handleAddToValidator"
          @reduceFromValidator="handleReduceFromValidator"
        >
        </stake-list-item>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { StakePosition, AccountAddressT, Amount, AmountT, Validator, ValidatorAddressT } from '@radixdlt/application'
import { computed, defineComponent, ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { safelyUnwrapAmount, safelyUnwrapValidator, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { asBigNumber } from '@/components/BigAmount.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { Position } from '@/services/_types'
import { useNativeToken, useStaking, useTransactions, useTokenBalances, useWallet } from '@/composables'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface StakeForm {
  validator: string;
  amount: number;
}

const WalletStaking = defineComponent({
  components: {
    ButtonSubmit,
    FormField,
    FormErrorMessage,
    LoadingIcon,
    StakeListItem,
    TabsContent,
    TabsTab
  },

  setup () {
    const { t } = useI18n({ useScope: 'global' })
    const { errors, values, meta, setErrors, resetForm, validate } = useForm<StakeForm>()
    const router = useRouter()
    const {
      activeAddress,
      activeAccount,
      activeAccountSub,
      explorerUrlBase,
      hardwareAccount,
      radix
    } = useWallet(router)
    const { activeForm, setActiveForm, activeStakes, activeUnstakes, loadingAnyStaking, stakingUnsub, validators } = useStaking(radix)
    const { stakeTokens, unstakeTokens, setActiveTransactionForm, transactionErrorMessage } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value)
    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)
    const { tokenBalances, tokenBalanceFor, tokenInfoFor, tokenBalancesUnsub } = useTokenBalances(radix, activeAccountSub)

    onBeforeRouteLeave(() => {
      nativeTokenUnsub()
      tokenBalancesUnsub()
      stakingUnsub()
    })

    // default active form is stake
    setActiveTransactionForm('stake')

    const setForm = (form: 'STAKING'|'UNSTAKING') => {
      setActiveForm(form)
      setActiveTransactionForm(form)
      resetForm()
    }

    const zero = Amount.fromUnsafe(0)._unsafeUnwrap()

    // Computed Values
    const xrdBalance: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return zero
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return zero
      return nativeTokenBalance.value
    })

    const relatedValidators: ComputedRef<Array<ValidatorAddressT>> = computed(() => {
      const vals: ValidatorAddressT[] = []
      if (activeStakes.value) {
        activeStakes.value.stakes.map((stake) => vals.push(stake.validator))
        activeStakes.value.pendingStakes.map((stake) => {
          if (!vals.find((v) => stake.validator.equals(v))) vals.push(stake.validator)
        })
      }
      if (activeUnstakes.value) {
        activeUnstakes.value.unstakes.map((unstake) => {
          if (!vals.find((v) => unstake.validator.equals(v))) vals.push(unstake.validator)
        })
        activeUnstakes.value.pendingUnstakes.map((unstake) => {
          if (!vals.find((v) => unstake.validator.equals(v))) vals.push(unstake.validator)
        })
      }
      return vals
    })

    const stakingDisclaimer: ComputedRef<string> = computed(() =>
      activeForm.value === 'STAKING' ? t('staking.stakeDisclaimer') : t('staking.unstakeDisclaimer'))

    const stakeButtonCopy: ComputedRef<string> = computed(() =>
      activeForm.value === 'STAKING' ? t('staking.stakeButton') : t('staking.unstakeButton'))

    const disableSubmit: ComputedRef<boolean> = computed(() => meta.value.dirty ? !meta.value.valid : true)

    const amountPlaceholder: ComputedRef<string> = computed(() =>
      (xrdBalance.value && activeForm.value === 'STAKING')
        ? `${t('staking.amountPlaceholder')} ${asBigNumber(xrdBalance.value, true)} `
        : t('staking.availableBalancePlaceholder'))

    const explorerUrl: ComputedRef<string> = computed(() => `${explorerUrlBase.value}/#/validators`)

    const hasTokenBalances = computed(() => {
      if (!tokenBalances.value?.account_balances.liquid_balances) return false
      return tokenBalances.value?.account_balances.liquid_balances.length > 0
    })

    const loadedAllData: ComputedRef<boolean> = computed(() => {
      if (activeAddress && activeAddress.value && nativeToken.value && tokenBalances.value) return true
      return false
    })

    // Methods
    const handleAddToValidator = (validator: ValidatorAddressT) => {
      setActiveForm('STAKING')
      setActiveTransactionForm('stake')
      values.validator = validator.toString()
      validate()
    }

    const handleReduceFromValidator = (validator: ValidatorAddressT) => {
      setActiveForm('UNSTAKING')
      setActiveTransactionForm('unstake')
      values.validator = validator.toString()
      validate()
    }

    const handleSubmitStake = () => {
      if (!tokenBalances.value || !nativeToken.value) return
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!meta.value.valid || !nativeTokenBalance) return
      const safeAddress = safelyUnwrapValidator(values.validator)
      const safeAmount = safelyUnwrapAmount(Number(values.amount))
      const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
      const validAmount = safeAmount && validateAmountOfType(safeAmount, nativeToken.value)

      if (!greaterThanZero) {
        setErrors({ amount: t('validations.greaterThanZero') })
        return
      }
      if (!validAmount) {
        setErrors({ amount: t('validations.amountOfType', { granularity: '' }) })
        return
      }
      if (!safeAddress || !safeAmount) return
      activeForm.value === 'STAKING'
        ? stakeTokens({
          to_validator: safeAddress,
          amount: safeAmount,
          tokenIdentifier: nativeToken.value.rri
        })
        : unstakeTokens({
          from_validator: safeAddress,
          amount: safeAmount,
          tokenIdentifier: nativeToken.value.rri
        })
    }

    return {
      stakeUrl: 'https://learn.radixdlt.com',
      activeForm,
      activeAddress,
      amountPlaceholder,
      errors,
      explorerUrl,
      explorerUrlBase,
      hasTokenBalances,
      loadedAllData,
      loadingAnyStaking,
      meta,
      nativeToken,
      relatedValidators,
      stakeButtonCopy,
      stakingDisclaimer,
      tokenBalances,
      values,
      xrdBalance,
      disableSubmit,
      handleAddToValidator,
      handleReduceFromValidator,
      handleSubmitStake,
      resetForm,
      setActiveForm,
      setErrors,
      setForm
    }
  }
})

export default WalletStaking
</script>
