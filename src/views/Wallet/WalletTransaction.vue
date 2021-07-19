<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-auto bg-rGrayLightest">
    <div class="py-6 px-8 bg-gray h-full">
      <div class="flex justify-between mb-16">
        <h3 class="font-medium text-rBlack">{{ $t('transaction.transactionHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm">
          <span class="text-rGrayDark mr-2">{{ $t('wallet.currentAddress') }}</span> <span class="font-mono text-rBlack">{{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy :text="activeAddress.toString()">
            </click-to-copy>
          </div>
        </div>
      </div>

      <form
        @submit.prevent="handleSubmit"
        v-if="tokenBalances.length > 0"
        class="flex flex-col items-end"
      >
        <div class="bg-white rounded-md border border-rGray text-rBlack mb-8 w-full">
          <template v-if="nativeToken && selectedCurrency">
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
                  rules="required|validAddress"
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
                      insufficientFunds: this.selectedCurrency.amount.toString()
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
                    :key="token.token.name"
                    :value="token.token.name"
                  >
                    {{ token.token.symbol.toUpperCase() }}
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
                      :rules="{
                        max: 160
                      }"
                    />
                  </div>
                  <FormCheckbox name="encrypt" label="Encrypt" :value="true" />
                </div>
                <FormErrorMessage name="message" class="text-sm text-red-400" />
              </div>
            </div>
          </template>
          <div v-else class="p-4 flex items-center justify-center">
            <loading-icon class="text-rGrayDark" />
          </div>
        </div>

        <ButtonSubmit :disabled="disableSubmit" class="w-52 ml-full">
          {{ $t('transaction.sendButton') }}
        </ButtonSubmit>
      </form>

      <div v-else>
        {{ $t('transaction.insufficientFunds') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, watch } from 'vue'
import { useForm } from 'vee-validate'

import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import { Token, TokenBalance, AccountAddressT } from '@radixdlt/application'
import { asBigNumber } from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import FormCheckbox from '@/components/FormCheckbox.vue'

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

  setup (props) {
    const { errors, values, meta, setErrors } = useForm<TransactionForm>()
    const currency: Ref<string | null> = ref(null)
    const tokenOptions: Ref<Array<TokenBalance>> = ref([])

    // Set XRD as default and move to top of list of options. Ensure native token subscription has returned before doing so
    const setXRDByDefault = (nativeToken: Token) => {
      const nativeTokenBalance: TokenBalance | undefined = props.tokenBalances.find((tb: TokenBalance) => tb.token.rri.equals(nativeToken.rri))
      if (nativeTokenBalance) currency.value = nativeTokenBalance.token.name

      tokenOptions.value = props.tokenBalances
        .reduce((acc: TokenBalance[], tb: TokenBalance) => {
          if (tb.token.rri.equals(nativeToken.rri)) return [tb, ...acc]
          return [...acc, tb]
        }, [])
    }

    if (props.nativeToken) setXRDByDefault(props.nativeToken)

    watch(() => props.nativeToken, (nativeToken: Token | undefined) => {
      if (nativeToken) setXRDByDefault(nativeToken)
    })

    return { errors, values, meta, setErrors, currency, tokenOptions }
  },

  props: {
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    tokenBalances: {
      type: Object as PropType<Array<TokenBalance>>,
      required: true,
      default: []
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: false
    }
  },

  computed: {
    selectedCurrency (): TokenBalance | null {
      if (this.tokenBalances.length <= 0) return null
      const selectedCurrency = this.tokenBalances.find((tokenBalance: TokenBalance) => tokenBalance.token.name === this.currency)
      return selectedCurrency || null
    },
    amountPlaceholder (): string {
      if (this.selectedCurrency && this.selectedCurrency.amount) {
        return `${this.$t('transaction.amountPlaceholder')} ${asBigNumber(this.selectedCurrency.amount)} `
      }
      return ''
    },
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    validAmount () {
      if (!this.selectedCurrency) return false

      const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
      const token = this.selectedCurrency.token
      const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
      const validAmount = safeAmount && validateAmountOfType(safeAmount, token) && validateGreaterThanZero(safeAmount)
      if (!greaterThanZero) {
        this.setErrors({
          amount: this.$t('validations.greaterThanZero')
        })
        return false
      }

      if (!validAmount) {
        this.setErrors({
          amount: this.$t('validations.amountOfType', { granularity: token.granularity.toString() })
        })
        return false
      }
      return true
    },

    handleSubmit () {
      if (!this.meta.valid || !this.selectedCurrency) return false
      const safeAddress = safelyUnwrapAddress(this.values.recipient)
      const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
      const token = this.selectedCurrency.token
      const greaterThanZero = safeAmount && validateGreaterThanZero(safeAmount)
      const validAmount = safeAmount && validateAmountOfType(safeAmount, token) && validateGreaterThanZero(safeAmount)
      if (!greaterThanZero) {
        this.setErrors({
          amount: this.$t('validations.greaterThanZero')
        })
      } else if (!validAmount) {
        this.setErrors({
          amount: this.$t('validations.amountOfType', { granularity: token.granularity.toString() })
        })
      } else {
        this.$emit('transferTokens', {
          to: safeAddress,
          amount: safeAmount,
          tokenIdentifier: token.rri.toString()
        },
        {
          plaintext: this.values.message,
          encrypt: this.values.encrypt
        },
        this.selectedCurrency)
      }
    }
  },

  emits: ['transferTokens']
})

export default WalletTransaction
</script>
