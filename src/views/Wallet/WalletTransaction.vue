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
        v-else
        @submit.prevent="handleSubmit"
        class="flex flex-col items-end"
      >
        <div class="bg-white rounded-md border border-rGray text-rBlack mb-8 w-full">
          <template v-if="loadedAllData && activeAddress">
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
                <div class="flex flex-col flex-1 mr-3" v-if="selectedCurrency">
                  <AmountField
                    :placeholder="amountPlaceholder"
                    name="amount"
                    label="Amount"
                    :rules="{
                      required: true,
                      validAmount: decimalType,
                      insufficientFunds: [selectedCurrency.value, decimalType]
                    }"
                  />
                  <FormErrorMessage name="amount" class="text-sm text-red-400" />
                </div>
                <select
                  class="border-t-0 border-r-0 border-l-0 py-2 border-rBlack focus:ring-0 focus:outline-none focus:border-rGreen"
                  v-model="currency"
                  v-if="tokenOptions"
                >
                  <option
                    v-for="token in tokenOptions"
                    :key="token.token.token_identifier.rri.toString()"
                    :value="token.token.token_identifier.rri.toString()"
                  >
                    {{ token.data?.symbol.toUpperCase() }}
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
                      @input="messageUpdated"
                    />
                  </div>
                  <Field v-slot="{ field }" name="encrypt" type="checkbox" :value="true" :initial-value="false" :unchecked-value="false" @input="messageUpdated">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" name="encrypt" v-bind="field" :value="true" />
                      <span>Encrypt</span>
                    </label>
                  </Field>
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
import { defineComponent, Ref, ref, ComputedRef, computed, watch, onMounted } from 'vue'
import { useForm, Field } from 'vee-validate'
import { interval, Subscription } from 'rxjs'
import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import { AccountAddressT, AmountOrUnsafeInput, Token } from '@radixdlt/application'
import { asBigNumber } from '@/helpers/asBigNumber'
import AmountField from '@/components/AmountField.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { useTokenBalances, useWallet } from '@/composables'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Decoded } from '@radixdlt/application/dist/api/open-api/_types'
import { getHiddenTokens } from '@/actions/vue/data-store'

interface TransactionForm {
  recipient: string;
  amount: string;
  message: string;
  encrypt: boolean;
}

type TokenOption = {
  token: Decoded.TokenAmount,
  data: Token | null
}

const refreshSub: Ref<Subscription | null> = ref(null)

const WalletTransaction = defineComponent({
  components: {
    AmountField,
    ButtonSubmit,
    ClickToCopy,
    Field,
    FormField,
    FormErrorMessage,
    LoadingIcon
  },

  setup () {
    const router = useRouter()
    const { errors, values, meta, setErrors, resetForm, setTouched } = useForm<TransactionForm>({
      initialValues: {
        recipient: '',
        amount: '',
        message: '',
        encrypt: false
      }
    })
    const { decimalType, transferTokens, cancelTransaction, setActiveTransactionForm, activeAddress, nativeToken, networkPreamble, radix, showDerivingModal } = useWallet(router)
    const { t } = useI18n({ useScope: 'global' })
    const { tokenInfoFor, fetchBalancesForAddress, tokenBalances, tokenBalanceFor, tokenBalanceForByString } = useTokenBalances(radix)
    const currency: Ref<string | null> = ref(null)
    const tokenOptions: Ref<TokenOption[]> = ref([])
    const hiddenTokens: Ref<string[]> = ref([])

    /* ------
     *  Lifecycle Events
     */
    onMounted(() => {
      getHiddenTokens().then((res) => {
        hiddenTokens.value = res
      })
      if (nativeToken.value) setXRDByDefault(nativeToken.value)
    })

    setActiveTransactionForm('transaction')

    const fetchAndRefreshAccountData = async (addr: AccountAddressT) => {
      if (refreshSub.value) {
        refreshSub.value.unsubscribe()
        refreshSub.value = null
      }

      await fetchBalancesForAddress(addr)
      refreshSub.value = interval(15000).subscribe(() => {
        fetchBalancesForAddress(addr)
      })
    }

    /* ------
     *  Side Effects
     */

    watch((activeAddress), () => {
      // Clear form input and validation errors when switching accounts
      resetForm()
      if (nativeToken.value) setXRDByDefault(nativeToken.value)
      setActiveTransactionForm('transaction')
    })

    watch((activeAddress), async (newActiveAddress, oldActiveAddress) => {
      if (!newActiveAddress) return
      if (oldActiveAddress && newActiveAddress.equals(oldActiveAddress)) return
      // Update balances when active address changes
      await fetchAndRefreshAccountData(newActiveAddress)
      if (nativeToken.value) setXRDByDefault(nativeToken.value)
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
    const hasTokenBalances: ComputedRef<boolean> = computed(() => {
      if (!tokenBalances.value?.account_balances.liquid_balances) return false
      return tokenBalances.value?.account_balances.liquid_balances.length > 0
    })

    const selectedCurrency: ComputedRef<Decoded.TokenAmount | null> = computed(() => {
      if (!tokenBalances.value || tokenBalances.value.account_balances.liquid_balances.length <= 0 || !currency.value) return null
      return tokenBalanceForByString(currency.value)
    })

    const amountPlaceholder: ComputedRef<string> = computed(() => {
      if (!selectedCurrency.value || !selectedCurrency.value.value) return ''
      return `${t('transaction.amountPlaceholder')} ${asBigNumber(selectedCurrency.value.value, true, decimalType.value)} `
    })

    const disableSubmit: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const loadedAllData: ComputedRef<boolean> = computed(() => {
      if (activeAddress.value && nativeToken.value && tokenBalances.value) return true
      return false
    })

    /* ------
     *  Functions
     */

    // Set XRD as default and move to top of list of options. Ensure native token subscription has returned before doing so
    const setXRDByDefault = (nativeToken: Token) => {
      if (!tokenBalances.value || tokenBalances.value.account_balances.liquid_balances.length === 0) return
      const nativeTokenBalance = tokenBalanceFor(nativeToken)
      const balances = tokenBalances.value ? tokenBalances.value.account_balances.liquid_balances : []
      currency.value = nativeTokenBalance ? nativeTokenBalance.token_identifier.rri.toString() : balances[0].token_identifier.rri.toString()

      const nativeTb = balances.find((b) => b.token_identifier.rri.equals(nativeToken.rri))
      const remainingTb = balances.filter((b) =>
        !b.token_identifier.rri.equals(nativeToken.rri) &&
        !hiddenTokens.value.find((ht) => b.token_identifier.rri.toString() === ht)
      ) || []

      const sortedOptions = nativeTb ? [nativeTb, ...remainingTb] : remainingTb
      tokenOptions.value = sortedOptions.map((token) => ({ token, data: tokenInfoFor(token.token_identifier.rri) }))
    }

    const handleSubmit = async () => {
      showDerivingModal.value = false

      if (!meta.value.valid || !selectedCurrency.value) return false
      const safeAddress = safelyUnwrapAddress(values.recipient, networkPreamble.value)
      const safeAmount = safelyUnwrapAmount(values.amount, decimalType.value)
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
          amount: t('validations.amountOfType', { granularity: token.granularity.toString() })
        })
        return
      }

      if (!safeAddress) {
        setErrors({
          recipient: t('validations.validAddress')
        })
        return
      }
      if (!safeAddress || !safeAddress) return

      const transferData = {
        to_account: safeAddress,
        amount: safeAmount as AmountOrUnsafeInput,
        tokenIdentifier: token.rri.toString()
      }
      const messageData = {
        plaintext: values.message,
        encrypt: values.encrypt
      }

      const currencyVal = selectedCurrency.value
      try {
        await transferTokens(transferData, messageData, currencyVal)
      } catch (e) {
        cancelTransaction()
        if (!activeAddress.value) return
        fetchAndRefreshAccountData(activeAddress.value)
      }
    }

    const messageUpdated = () => {
      if (values.encrypt && values.message === '') {
        setErrors({
          message: t('validations.messageRequired')
        })
      } else {
        setErrors({
          message: undefined
        })
      }
    }

    return {
      activeAddress,
      amountPlaceholder,
      currency,
      decimalType,
      errors,
      hasTokenBalances,
      meta,
      nativeToken,
      networkPreamble,
      selectedCurrency,
      tokenBalances,
      tokenOptions,
      values,

      // Functions
      disableSubmit,
      handleSubmit,
      loadedAllData,
      setErrors,
      tokenInfoFor,
      messageUpdated
    }
  }
})

export default WalletTransaction
</script>
