<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-auto bg-rGrayLightest">
    <div class="py-6 px-8 bg-gray h-full">
      <div class="flex justify-between mb-16">
        <h3 class="font-medium text-rBlack">{{ $t('transaction.transactionHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm" v-if="activeAddress">
          <span class="text-rGrayDark mr-2">{{ $t('wallet.currentAddress') }}</span> <span class="font-mono text-rBlack">{{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy
              :address="activeAddress.toString()"
              :checkForHardwareAddress=true
              @verifyHardwareAddress="verifyHardwareAddress()"
            />
          </div>
        </div>
      </div>

      <div v-if="!loadedAllData" class="p-4 flex items-center justify-center">
        <loading-icon class="text-rGrayDark" />
      </div>
      <div v-else-if="!hasTokenBalances" class="p-4 flex items-center justify-center">
        {{ $t('transaction.insufficientFunds') }}
      </div>
      <form
        @submit.prevent="handleSubmit"
        v-else
        class="flex flex-col items-end"
      >
        <div class="bg-white rounded-md border border-rGray text-rBlack mb-8 w-full">
          <template v-if="loadedAllData">
            <div class="border-b border-rGray py-7 flex items-center">
              <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.fromLabel') }}</div>
              <div class="flex-1 font-mono">{{ activeAddress.toString() }}</div>
            </div>

            <div class="border-b border-rGray py-7 flex items-center">
              <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.toLabel') }}</div>
              <div class="flex-1 pr-8">
                <FormField
                  name="recipient"
                  type="text"
                  class="w-full font-mono placeholder-sans"
                  :placeholder="$t('transaction.recipientPlaceholder')"
                  :rules="{
                    required: true,
                    validAddress: networkPreamble
                  }"
                />
                <FormErrorMessage name="recipient" class="text-sm text-red-400" />
              </div>
            </div>

            <div class="border-b border-rGray py-7 flex items-center">
              <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.amountLabel') }}</div>
              <div class="flex-1 flex items-start pr-8">
                <div class="flex flex-col flex-1 mr-3">
                  <FormField
                    type="number"
                    name="amount"
                    label="Amount"
                    class="w-full"
                    :placeholder="amountPlaceholder"
                    step="any"
                    :rules="{
                      required: true,
                      validAmount: true,
                      insufficientFunds: this.selectedCurrency.value.toString()
                    }"
                  />

                  <FormErrorMessage name="amount" class="text-sm text-red-400" />
                </div>
                <select
                  class="border-t-0 border-r-0 border-l-0 py-2 border-rBlack focus:ring-0 focus:outline-none focus:border-rGreen"
                  v-model="currency"
                >
                  <option
                    v-for="token in tokenOptions"
                    :key="token.token_identifier.rri.name"
                    :value="token.token_identifier.rri.name"
                  >
                    {{ tokenInfoFor(token.token_identifier.rri).symbol.toUpperCase() }}
                  </option>
                </select>
              </div>
            </div>

            <div class="border-b border-rGray  py-7 flex items-center">
              <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.messageLabel') }}</div>
              <div class="flex-1 pr-8">
                <div class="flex items-center">
                  <div class="flex-1 mr-3">
                    <FormField
                      name="message"
                      type="text"
                      class="w-full"
                      label="Message"
                      :placeholder="$t('transaction.messagePlaceholder')"
                      :rules="{}"
                    />
                  </div>
                  <FormCheckbox name="encrypt" label="Encrypt" :value="true" />
                </div>
                <FormErrorMessage name="message" class="text-sm text-red-400" />
              </div>
            </div>
          </template>
        </div>

        <ButtonSubmit :disabled="disableSubmit" class="w-52 ml-full">
          {{ $t('transaction.sendButton') }}
        </ButtonSubmit>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, ComputedRef, computed, watch } from 'vue'
import { useForm } from 'vee-validate'

import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import { Token } from '@radixdlt/application'
import { asBigNumber } from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import FormCheckbox from '@/components/FormCheckbox.vue'
import { useNativeToken, useTransactions, useTokenBalances, useWallet } from '@/composables'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'
import { Observed } from '@/helpers/typeHelpers'

interface TransactionForm {
  recipient: string;
  amount: number;
  message: string;
  encrypt: boolean;
}

const WalletTransaction = defineComponent({
  components: {
    ButtonSubmit,
    ClickToCopy,
    FormCheckbox,
    FormField,
    FormErrorMessage,
    LoadingIcon
  },

  setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<TransactionForm>()
    const router = useRouter()
    const { activeAddress, activeAccount, hardwareAccount, networkPreamble, radix, verifyHardwareWalletAddress } = useWallet(router)

    const { transactionUnsub, setActiveTransactionForm, transferTokens } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value)

    setActiveTransactionForm('transaction')

    const { t } = useI18n({ useScope: 'global' })
    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)
    const { tokenBalances, tokenBalanceFor, tokenInfoFor, tokenBalancesUnsub } = useTokenBalances(radix)
    const nativeTokenLoaded: Ref<boolean> = ref(false)

    onBeforeRouteLeave(() => {
      nativeTokenUnsub()
      tokenBalancesUnsub()
      transactionUnsub()
    })

    // Clear form input and validation errors when switching accounts
    watch(activeAddress, () => {
      resetForm()
    })

    // reset currency when required state has loaded. Especially necessary when switching account
    watch([nativeToken, tokenBalances], ([nt, tb]) => {
      if (tb && nt && !nativeTokenLoaded.value) {
        setXRDByDefault(nt)
        nativeTokenLoaded.value = true
      }
    })

    type tokenAmountT = Observed<ReturnType<typeof radix.ledger.tokenBalancesForAddress>>;

    const currency: Ref<string | null> = ref(null)
    const tokenOptions: Ref<Decoded.TokenAmount[]> = ref([]) // To Do fix this any

    // Set XRD as default and move to top of list of options. Ensure native token subscription has returned before doing so
    const setXRDByDefault = (nativeToken: Token) => {
      if (!tokenBalances.value || tokenBalances.value.account_balances.liquid_balances.length === 0) return
      const nativeTokenBalance = tokenBalanceFor(nativeToken)
      const balances = tokenBalances.value ? tokenBalances.value.account_balances.liquid_balances : []

      currency.value = nativeTokenBalance ? nativeTokenBalance.token_identifier.rri.name : balances[0].token_identifier.rri.name

      const nativeTb = balances.find((b) => b.token_identifier.rri.equals(nativeToken.rri))
      const remainingTb = balances.filter((b) => !b.token_identifier.rri.equals(nativeToken.rri)) || []
      tokenOptions.value = nativeTb ? [nativeTb, ...remainingTb] : remainingTb
    }

    if (nativeToken.value) setXRDByDefault(nativeToken.value)

    const hasTokenBalances = computed(() => {
      if (!tokenBalances.value?.account_balances.liquid_balances) return false
      return tokenBalances.value?.account_balances.liquid_balances.length > 0
    })

    const selectedCurrency: ComputedRef<Decoded.TokenAmount | null> = computed(() => {
      if (!tokenBalances.value || tokenBalances.value.account_balances.liquid_balances.length <= 0) return null

      const selectedCurrency = tokenBalances.value.account_balances.liquid_balances.find((tokenBalance) => tokenBalance.token_identifier.rri.name === currency.value)
      return selectedCurrency || null
    })

    const amountPlaceholder: ComputedRef<string> = computed(() => {
      if (!selectedCurrency.value || !selectedCurrency.value.value) return ''
      return `${t('transaction.amountPlaceholder')} ${asBigNumber(selectedCurrency.value.value, true)} `
    })

    const disableSubmit: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const loadedAllData: ComputedRef<boolean> = computed(() => {
      if (activeAddress && activeAddress.value && nativeToken.value && tokenBalances.value) return true
      return false
    })

    return {
      tokenBalances,
      errors,
      values,
      meta,
      hasTokenBalances,
      setErrors,
      currency,
      tokenOptions,
      selectedCurrency,
      nativeToken,
      networkPreamble,
      amountPlaceholder,
      activeAddress,
      disableSubmit,
      loadedAllData,
      verifyHardwareWalletAddress,
      tokenInfoFor,
      handleSubmit () {
        if (!meta.value.valid || !selectedCurrency.value) return false
        const safeAddress = safelyUnwrapAddress(values.recipient, networkPreamble.value)
        const safeAmount = safelyUnwrapAmount(Number(values.amount))
        const token = tokenInfoFor(selectedCurrency.value.token_identifier.rri)
        if (!token) return false
        const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
        // to do: we need to get full token info before we can validate
        const validAmount = safeAmount && validateAmountOfType(safeAmount, token) && validateGreaterThanZero(safeAmount)
        if (!greaterThanZero) {
          setErrors({ amount: t('validations.greaterThanZero') })
          return
        }
        if (!validAmount) {
          setErrors({
            amount: t('validations.amountOfType', { granularity: 'hi' })
          })
          return
        }

        if (!safeAddress) {
          setErrors({
            recipient: t('validations.validAddress')
          })
          return
        }

        if (safeAddress && safeAmount) {
          transferTokens(
            {
              to_account: safeAddress,
              amount: safeAmount,
              tokenIdentifier: token.rri.toString()
            },
            {
              plaintext: values.message,
              encrypt: values.encrypt
            },
            selectedCurrency.value
          )
        }
      }
    }
  }
})

export default WalletTransaction
</script>
