<template>
  <div class="bg-rGrayLightest flex flex-row w-full p-5 flex-1 h-screen overflow-y-auto">
    <div v-if="!loadedAllData || !nativeToken" class="p-4 flex items-center justify-center flex-1 h-32">
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
        @submit.prevent="handleSubmitStakeForm"
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
              :validateOnInput="true"
            />
            <FormErrorMessage name="validator" class="text-sm text-red-400" />
          </div>
          <div class="pt-3 pb-8 px-4 text-sm">
            <div class="flex flex-row">
              <div class="flex flex-col mr-3 flex-1">
                <div class="text-rGrayDark mb-3">{{ $t('staking.amountLabel')}}</div>
                <div
                  v-if="maxUnstakeMode"
                  class="border"
                >
                  <div class="rounded border border-rGreen bg-rGray h-full flex justify-between py-1">
                    <div class="ml-2 mt-1">{{ $t('staking.unstakeMaxDisclaimer') }} {{ formValidatorName }}</div>
                    <div class="mr-2 mt-2">
                      <button @click="setMaxUnstakeOff">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="6.5" transform="rotate(90 7 7)" fill="#7A99AC" stroke="#7A99AC"/>
                          <rect x="4" y="5" width="1" height="7" transform="rotate(-45 4 5)" fill="white"/>
                          <rect x="8.94971" y="4.29291" width="1" height="7" transform="rotate(45 8.94971 4.29291)" fill="white"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <FormField
                    name="amount"
                    type="number"
                    step="any"
                    class="w-9/12 text-sm justify-items-start"
                    :class="{'w-full': activeForm !== 'UNSTAKING'}"
                    :placeholder="amountPlaceholder"
                    rules="required|validAmount"
                    @input="compareToMaxUnstakeAmount"
                    :validateOnInput="true"
                  />
                  <button
                    @click.prevent="setMaxUnstakeOn"
                    v-if="activeForm == 'UNSTAKING'"
                    class="rounded border border-rGreen text-rGreen w-2/12 h-full ml-6"
                  >
                    {{ $t('staking.maxUnstakeButton') }}
                  </button>
                </div>
                <FormErrorMessage name="amount" class="text-sm text-red-400" errorClass="w-120" />
                <div v-if="showMaxUnstakeNotification" class="flex items-center gap-2 max-w-md">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM7.875 3.5C7.875 3.98325 7.48325 4.375 7 4.375C6.51675 4.375 6.125 3.98325 6.125 3.5C6.125 3.01675 6.51675 2.625 7 2.625C7.48325 2.625 7.875 3.01675 7.875 3.5ZM6.125 6.125C5.64175 6.125 5.25 6.51675 5.25 7C5.25 7.48325 5.64175 7.875 6.125 7.875V10.5C6.125 10.9832 6.51675 11.375 7 11.375H7.875C8.35825 11.375 8.75 10.9832 8.75 10.5C8.75 10.0168 8.35825 9.625 7.875 9.625V7C7.875 6.51675 7.48325 6.125 7 6.125H6.125Z" fill="#052CC0"/>
                  </svg>
                  <span v-if="showMaxUnstakeOverageNotification" class=" text-xs text-rBlue flex-1 ">
                    {{$t('staking.maxUnstakeModeOverageNotification')}}
                  </span>
                  <span v-else class=" text-xs text-rBlue flex-1 ">{{$t('staking.maxUnstakeModeEnabledNotification')}}</span>
                </div>
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
          @addToValidator="handleAddToValidator"
          @reduceFromValidator="handleReduceFromValidator"
        >
        </stake-list-item>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { AccountAddressT, Amount, AmountT, Radix, StakeTokensInput, TokenBalance, UnstakeTokensInput, ValidatorAddressT } from '@radixdlt/application'
import { computed, defineComponent, ComputedRef, onMounted, onUnmounted, watch, Ref, ref } from 'vue'
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
import { useStaking, useTransactions, useTokenBalances, useWallet } from '@/composables'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { interval, Subscription, firstValueFrom } from 'rxjs'
import { Decoded, AccountBalancesEndpoint } from '@radixdlt/application/dist/api/open-api/_types'

interface StakeForm {
  validator: string;
  amount: number;
}
const refreshSub: Ref<Subscription | null> = ref(null)

const uniqBy = (arr: any[], predicate: (item: any) => string) => {
  if (!Array.isArray(arr)) { return [] }
  const cb = typeof predicate === 'function' ? predicate : (o: any) => o[predicate]

  const pickedObjects = arr
    .filter(item => item)
    .reduce((map, item) => {
      const key = cb(item)

      if (!key) { return map }

      return map.has(key) ? map : map.set(key, item)
    }, new Map())
    .values()

  return [...pickedObjects]
}

let stake: (client: ReturnType<typeof Radix.create>, input: StakeTokensInput) => void
let unstake: (client: ReturnType<typeof Radix.create>, input: UnstakeTokensInput) => void

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
    const router = useRouter()
    const { t } = useI18n({ useScope: 'global' })
    const { errors, values, meta, setErrors, resetForm, validateField } = useForm<StakeForm>()
    const {
      activeAddress,
      activateAccount,
      explorerUrlBase,
      hardwareAccount,
      activeNetwork,
      nativeToken,
      radix
    } = useWallet(router)

    if (!activeNetwork.value || !nativeToken.value) {
      router.push('/')
      return {}
    }
    const { activeForm, setActiveForm, activeStakes, activeUnstakes, loadingAnyStaking, maybeGetValidator, fetchValidatorsAndStakes, getActiveStakeAmountForValidator } = useStaking(radix, activeNetwork.value)
    const { setActiveTransactionForm, cancelTransaction } = useTransactions(radix, router, activeAddress.value, hardwareAccount.value)
    const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
    const maxUnstakeMode: Ref<boolean> = ref(false)
    const tokenBalances: Ref<AccountBalancesEndpoint.DecodedResponse | null> = ref(null)
    const nativeTokenBalance: Ref<Decoded.TokenAmount | null> = ref(null)
    const showMaxUnstakeNotification: Ref<boolean> = ref(false)
    const showMaxUnstakeOverageNotification: Ref<boolean> = ref(false)

    /* ------
     *  Side Effects
     */

    const fetchData = async (addr: AccountAddressT) => {
      tokenBalances.value = await firstValueFrom(radix.ledger.tokenBalancesForAddress(addr))
      nativeTokenBalance.value = tokenBalances.value.account_balances.liquid_balances.find((lb) => {
        if (!nativeToken.value) return false
        return lb.token_identifier.rri.equals(nativeToken.value.rri)
      }) || null
      await fetchValidatorsAndStakes(addr)
    }

    const fetchAndRefreshData = async (addr: AccountAddressT) => {
      if (refreshSub.value) {
        refreshSub.value.unsubscribe()
        refreshSub.value = null
      }

      await fetchData(addr)
      refreshSub.value = interval(15000).subscribe(() => {
        fetchData(addr)
      })
    }

    watch(activeAddress, () => {
      resetForm()
      setActiveTransactionForm('stake')
    })

    watch(activeAddress, async (newActiveAddress, oldActiveAddress) => {
      if (!newActiveAddress) return
      if (oldActiveAddress && newActiveAddress.equals(oldActiveAddress)) return
      await fetchAndRefreshData(newActiveAddress)
      const { stakeTokens, unstakeTokens } = useTransactions(radix, router, newActiveAddress, hardwareAccount.value)
      stake = stakeTokens
      unstake = unstakeTokens
    }, { immediate: true })

    onBeforeRouteLeave(() => {
      if (refreshSub.value) {
        refreshSub.value.unsubscribe()
        refreshSub.value = null
      }
    })

    /* ------
     *  Computed Values
     */

    const xrdBalance: ComputedRef<AmountT> = computed(() => {
      return nativeTokenBalance.value ? nativeTokenBalance.value.value : zero
    })

    const relatedValidators: ComputedRef<Array<ValidatorAddressT>> = computed(() => {
      const stakeValidators = activeStakes.value ? [
        ...activeStakes.value.stakes.map((stake) => stake.validator),
        ...activeStakes.value.pendingStakes.map((stake) => stake.validator)
      ] : []

      const unstakeValidators = activeUnstakes.value ? [
        ...activeUnstakes.value.unstakes.map((stake) => stake.validator),
        ...activeUnstakes.value.pendingUnstakes.map((stake) => stake.validator)
      ] : []
      return uniqBy([...stakeValidators, ...unstakeValidators], (v) => v.toString())
    })

    const stakingDisclaimer: ComputedRef<string> = computed(() =>
      activeForm.value === 'STAKING' ? t('staking.stakeDisclaimer') : t('staking.unstakeDisclaimer'))

    const stakeButtonCopy: ComputedRef<string> = computed(() =>
      activeForm.value === 'STAKING' ? t('staking.stakeButton') : t('staking.unstakeButton'))

    const disableSubmit: ComputedRef<boolean> = computed(() => {
      if (maxUnstakeMode.value && !meta.value.valid) return false
      return meta.value.dirty ? !meta.value.valid : true
    })

    const amountPlaceholder: ComputedRef<string> = computed(() =>
      (xrdBalance.value && activeForm.value === 'STAKING')
        ? `${t('staking.amountPlaceholder')} ${asBigNumber(xrdBalance.value, true)} `
        : t('staking.availableBalancePlaceholder'))

    const explorerUrl: ComputedRef<string> = computed(() => `${explorerUrlBase.value}/#/validators`)

    const hasTokenBalances: ComputedRef<boolean> = computed(() => {
      if (!tokenBalances.value?.account_balances.liquid_balances) return false
      return tokenBalances.value?.account_balances.liquid_balances.length > 0
    })

    const loadedAllData: ComputedRef<boolean> = computed(() => {
      if (activeAddress.value && nativeToken.value && tokenBalances.value) return true
      return false
    })

    /* ------
     *  Functions
     */

    const setForm = (form: 'STAKING'|'UNSTAKING') => {
      setActiveForm(form)
      setActiveTransactionForm(form)
      resetForm()
      setMaxUnstakeOff()
    }

    const handleAddToValidator = (validator: ValidatorAddressT) => {
      setActiveForm('STAKING')
      setActiveTransactionForm('stake')
      resetForm()
      setMaxUnstakeOff()
      values.validator = validator.toString()
      validateField('validator')
    }

    const handleReduceFromValidator = (validator: ValidatorAddressT) => {
      setActiveForm('UNSTAKING')
      setActiveTransactionForm('unstake')
      resetForm()
      setMaxUnstakeOff()
      values.validator = validator.toString()
      validateField('validator')
    }

    const compareToMaxUnstakeAmount = () => {
      if (activeForm.value === 'STAKING') return
      const safeAddress = safelyUnwrapValidator(values.validator)
      const safeAmount = safelyUnwrapAmount(Number(values.amount))
      if (!safeAddress || !safeAmount) return

      const activeValidatorStakeAmount = getActiveStakeAmountForValidator(safeAddress)
      const maxAmount = +asBigNumber(activeValidatorStakeAmount) as number
      const currentValue = +asBigNumber(safeAmount) as number
      const minDifference = maxAmount - currentValue

      if (minDifference <= 0.000001) {
        setMaxUnstakeNotificationOn()
        setMaxUnstakeOn()

        if (minDifference < 0) {
          setMaxUnstakeOverageNotifcationOn()
        } else {
          setMaxUnstakeOverageNotifcationOff()
        }
      }
    }

    const handleSubmitStake = async () => {
      if (!tokenBalances.value || !nativeToken.value) return
      if (!meta.value.valid || !nativeTokenBalance.value) return
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
      const data = activeForm.value === 'STAKING' ? {
        to_validator: safeAddress,
        amount: safeAmount,
        tokenIdentifier: nativeToken.value?.rri
      } : {
        from_validator: safeAddress,
        amount: safeAmount,
        tokenIdentifier: nativeToken.value?.rri
      }
      activateAccount((client: ReturnType<typeof Radix.create>) => {
        activeForm.value === 'STAKING'
          ? stake(client, data as StakeTokensInput)
          : unstake(client, data as UnstakeTokensInput)
      }).catch((e) => {
        cancelTransaction()
        if (!activeAddress.value) return
        fetchAndRefreshData(activeAddress.value)
      })
    }

    const handleMaxSubmitUnstake = () => {
      const safeAddress = safelyUnwrapValidator(values.validator)
      if (!safeAddress) return
      const safeOneHundredPercent = safelyUnwrapAmount(Number('0.0000000000000001'))
      if (!safeOneHundredPercent) return

      activateAccount((client) => {
        if (!nativeToken.value) return
        unstake(client, {
          from_validator: safeAddress,
          unstake_percentage: safeOneHundredPercent,
          tokenIdentifier: nativeToken.value.rri
        })
      }).catch((e) => {
        cancelTransaction()
        if (!activeAddress.value) return
        fetchAndRefreshData(activeAddress.value)
      })
    }

    const setMaxUnstakeOn = () => {
      maxUnstakeMode.value = true
    }

    const setMaxUnstakeOff = () => {
      if (showMaxUnstakeNotification.value) {
        setMaxUnstakeNotifcationOff()
      }
      maxUnstakeMode.value = false
    }

    const setMaxUnstakeNotificationOn = () => {
      showMaxUnstakeNotification.value = true
    }

    const setMaxUnstakeNotifcationOff = () => {
      showMaxUnstakeNotification.value = false
    }

    const setMaxUnstakeOverageNotifcationOn = () => {
      showMaxUnstakeOverageNotification.value = true
    }

    const setMaxUnstakeOverageNotifcationOff = () => {
      showMaxUnstakeOverageNotification.value = false
    }

    const handleSubmitStakeForm = () => {
      if (maxUnstakeMode.value && activeForm.value === 'UNSTAKING') {
        handleMaxSubmitUnstake()
      } else {
        handleSubmitStake()
      }
    }

    const formValidatorName: ComputedRef<string | undefined> = computed(() => {
      if (!values.validator) return ''
      const safeAddress = safelyUnwrapValidator(values.validator)
      if (!safeAddress) return ''
      const v = maybeGetValidator(safeAddress)
      return v ? v.name : ''
    })

    return {
      activeForm,
      activeAddress,
      amountPlaceholder,
      errors,
      explorerUrl,
      explorerUrlBase,
      formValidatorName,
      hasTokenBalances,
      loadedAllData,
      loadingAnyStaking,
      maxUnstakeMode,
      meta,
      nativeToken,
      relatedValidators,
      stakeButtonCopy,
      stakeUrl: 'https://learn.radixdlt.com',
      stakingDisclaimer,
      tokenBalances,
      values,
      xrdBalance,
      showMaxUnstakeNotification,
      showMaxUnstakeOverageNotification,

      // methods
      handleSubmitStakeForm,
      disableSubmit,
      handleAddToValidator,
      handleReduceFromValidator,
      handleSubmitStake,
      resetForm,
      setActiveForm,
      setErrors,
      setForm,
      setMaxUnstakeOff,
      setMaxUnstakeOn,
      compareToMaxUnstakeAmount
    }
  }
})

export default WalletStaking
</script>
