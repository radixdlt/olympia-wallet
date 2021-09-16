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

      <stake-list-item
        v-for="(position) in sortedPositions"
        :key="position.address"
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
import { StakePosition, UnstakePosition, AccountAddressT, Amount, AmountT } from '@radixdlt/application'
import { computed, defineComponent, Ref, ref, ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import StakeListItem from '@/components/StakeListItem.vue'
import { safelyUnwrapAmount, safelyUnwrapValidator, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { asBigNumber } from '@/components/BigAmount.vue'
import { Position } from '@/services/_types'
import { useNativeToken, useRadix, useStaking, useTransactions, useTokenBalances, useWallet } from '@/composables'
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
    StakeListItem,
    TabsContent,
    TabsTab
  },

  setup () {
    const activeForm: Ref<string> = ref('stake')
    const { t } = useI18n({ useScope: 'global' })
    const { errors, values, meta, setErrors, resetForm } = useForm<StakeForm>()
    const { radix } = useRadix()
    const router = useRouter()
    const {
      activeAddress,
      activeAccount,
      hardwareAccount,
      hardwareAccountFailedToSign
    } = useWallet(radix, router)

    const { stakeTokens, unstakeTokens, transactionUnsub } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value, {
      ledgerSigningError: () => {
        hardwareAccountFailedToSign()
      }
    })

    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)
    const { tokenBalances, tokenBalanceFor, tokenBalancesUnsub } = useTokenBalances(radix)
    const { activeStakes, activeUnstakes, stakingUnsub } = useStaking(radix)

    onBeforeRouteLeave(() => {
      nativeTokenUnsub()
      tokenBalancesUnsub()
      stakingUnsub()
      transactionUnsub()
    })

    const setForm = (form: string) => {
      activeForm.value = form
      resetForm()
    }

    // Computed Values
    const xrdBalance: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return Amount.fromUnsafe(0)._unsafeUnwrap()
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      return nativeTokenBalance ? nativeTokenBalance.amount : Amount.fromUnsafe(0)._unsafeUnwrap()
    })

    const sortedPositions: ComputedRef<Array<Position>> = computed(() => {
      if (!activeStakes.value || !activeUnstakes.value) return []
      // If more than 1 stake exists for the same validator, only display the validator once and sum their amounts
      let positions: Position[] = []

      activeStakes.value.forEach((stake: StakePosition) => {
        const existingPositionIndex = positions.findIndex((pos: Position) => pos.validator.equals(stake.validator))
        const address = stake.validator.toString()
        if (existingPositionIndex === -1) {
          positions = [...positions, { address, validator: stake.validator, stakes: [stake], unstakes: [] }]
        } else {
          positions[existingPositionIndex] = { ...positions[existingPositionIndex], stakes: [...positions[existingPositionIndex].stakes, stake] }
        }
      })

      activeUnstakes.value.forEach((unstake: UnstakePosition) => {
        const address = unstake.validator.toString()
        const existingPositionIndex = positions.findIndex((pos: Position) => pos.validator.equals(unstake.validator))
        if (existingPositionIndex === -1) {
          positions = [...positions, { address, validator: unstake.validator, unstakes: [unstake], stakes: [] }]
        } else {
          positions[existingPositionIndex] = { ...positions[existingPositionIndex], unstakes: [...positions[existingPositionIndex].unstakes, unstake] }
        }
      })

      return positions.sort((a: Position, b: Position) => {
        const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
        const aTotal = a.stakes.map((el: StakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr), zero)
        const bTotal = b.stakes.map((el: StakePosition) => el.amount).reduce((prev: AmountT, curr: AmountT) => prev.add(curr), zero)
        if (aTotal > bTotal) return -1
        if (bTotal > aTotal) return 1
        return 0
      })
    })

    const stakingDisclaimer: ComputedRef<string> = computed(() =>
      activeForm.value === 'stake' ? t('staking.stakeDisclaimer') : t('staking.unstakeDisclaimer'))

    const stakeButtonCopy: ComputedRef<string> = computed(() =>
      activeForm.value === 'stake' ? t('staking.stakeButton') : t('staking.unstakeButton'))

    const disableSubmit: ComputedRef<boolean> = computed(() => meta.value.dirty ? !meta.value.valid : true)

    const amountPlaceholder: ComputedRef<string> = computed(() =>
      (xrdBalance.value && activeForm.value === 'stake')
        ? `${t('staking.amountPlaceholder')} ${asBigNumber(xrdBalance.value)} `
        : t('staking.availableBalancePlaceholder'))

    const explorerUrl: ComputedRef<string> = computed(() => `${process.env.VUE_APP_EXPLORER}/#/validators`)

    // Methods
    const handleAddToValidator = (validator: AccountAddressT) => {
      activeForm.value = 'stake'
      values.validator = validator.toString()
    }

    const handleReduceFromValidator = (validator: AccountAddressT) => {
      activeForm.value = 'unstake'
      values.validator = validator.toString()
    }

    const handleSubmitStake = () => {
      if (!tokenBalances.value || !nativeToken.value) return
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!meta.value.valid || !nativeTokenBalance) return
      const safeAddress = safelyUnwrapValidator(values.validator)
      const safeAmount = safelyUnwrapAmount(Number(values.amount))
      const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
      const validAmount = safeAmount && validateAmountOfType(safeAmount, nativeTokenBalance.token)

      if (!greaterThanZero) {
        setErrors({ amount: t('validations.greaterThanZero') })
        return
      }
      if (!validAmount) {
        setErrors({ amount: t('validations.amountOfType', { granularity: nativeTokenBalance.token.granularity.toString() }) })
        return
      }
      if (!safeAddress || !safeAmount) return
      activeForm.value === 'stake'
        ? stakeTokens({
          validator: safeAddress,
          amount: safeAmount
        })
        : unstakeTokens({
          validator: safeAddress,
          amount: safeAmount
        })
    }

    return {
      stakeUrl: 'https://learn.radixdlt.com',
      activeForm,
      activeAddress,
      tokenBalances,
      nativeToken,
      errors,
      values,
      meta,
      setErrors,
      resetForm,
      sortedPositions,
      xrdBalance,
      stakingDisclaimer,
      stakeButtonCopy,
      disableSubmit,
      amountPlaceholder,
      explorerUrl,
      setForm,
      handleAddToValidator,
      handleReduceFromValidator,
      handleSubmitStake
    }
  }
})

export default WalletStaking
</script>
