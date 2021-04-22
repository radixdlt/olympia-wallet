<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll bg-rGrayLightest">
    <div class="py-6 px-8 bg-gray h-full">
      <div class="flex justify-between mb-16">
        <h3 class="font-medium text-rBlack">{{ $t('transaction.transactionHeading') }}</h3>
        <div class="flex items-center text-rGrayDark">
          <div class="text-sm mr-3">{{ activeAddress.toString() }}</div>
          <click-to-copy :text="activeAddress.toString()">
            <span class="text-xs">{{ $t('wallet.copyAddress') }}</span>
          </click-to-copy>
        </div>
      </div>

      <form
        @submit.prevent="handleSubmit"
        v-if="tokenBalances.tokenBalances.length > 0"
        class="flex flex-col items-end"
      >
        <div class="bg-white rounded-md border border-rGray text-rBlack mb-8 w-full">
          <div class="border-b border-rGray py-7 flex items-center">
            <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.fromLabel') }}</div>
            <div class="flex-1">{{ activeAddress.toString() }}</div>
          </div>

          <div class="border-b border-rGray py-7 flex items-center">
            <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.toLabel') }}</div>
            <div class="flex-1 pr-8">
              <FormField
                name="recipient"
                type="text"
                class="w-full"
                :placeholder="$t('transaction.recipientPlaceholder')"
                rules="required|validAddress"
              />
              <FormErrorMessage name="recipient" class="mt-4 text-sm text-red-400" />
            </div>
          </div>

          <div class="border-b border-rGray py-7 flex items-center">
            <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.amountLabel') }}</div>
            <div class="flex-1 flex items-start pr-8">
              <div class="flex flex-col flex-1 mr-3">
                <FormField
                  name="amount"
                  type="number"
                  step="any"
                  class="w-full"
                  :placeholder="amountPlaceholder"
                  :rules="{
                    required: true,
                    validAmount: true,
                    insufficientFunds: this.selectedCurrency.amount.toString()
                  }"
                />
                <FormErrorMessage name="amount" class="mt-4 text-sm text-red-400" />
              </div>
              <select
                class="border-t-0 border-r-0 border-l-0 py-2 border-rBlack focus:ring-0 focus:outline-none focus:border-rGreen"
                v-model="currency"
              >
                <option
                  v-for="token in tokenBalances.tokenBalances"
                  :key="token.token.name"
                  :value="token.token.name"
                >
                  {{ token.token.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="border-b border-rGray  py-7 flex items-center">
            <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.messageLabel') }}</div>
            <div class="flex-1 pr-8">
              <FormField
                name="message"
                type="text"
                class="w-full"
                :placeholder="$t('transaction.messagePlaceholder')"
                rules=""
              />
              <FormErrorMessage name="message" class="mt-4 text-sm text-red-400" />
            </div>
          </div>

          <div class="py-7 flex items-center">
            <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.feeLabel') }}</div>
            <div class="flex-1 text-2xl font-light">00.000</div>
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center px-6 py-4 border font-normal leading-snug rounded w-52 transition-colors bg-rGreen border-rGreen text-white"
        >
          {{ $t('transaction.sendButton') }}
        </button>
      </form>

      <div v-else>
        {{ $t('transaction.insufficientFunds') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { AddressT } from '@radixdlt/account'
import { defineComponent, PropType } from 'vue'
import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType } from '@/helpers/validateRadixTypes'
import { TokenBalance, TokenBalances } from '@radixdlt/application'
import { useForm } from 'vee-validate'
import ClickToCopy from '@/components/ClickToCopy.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'

interface TransactionForm {
  recipient: string;
  amount: number;
  message: string;
}

const WalletTransaction = defineComponent({
  components: {
    ClickToCopy,
    FormField,
    FormErrorMessage
  },

  setup () {
    const { errors, values, meta, setErrors } = useForm<TransactionForm>()

    return { errors, values, meta, setErrors }
  },

  props: {
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    },
    tokenBalances: {
      type: Object as PropType<TokenBalances>,
      required: true
    }
  },

  data () {
    return {
      currency: this.tokenBalances.tokenBalances.length > 0 ? this.tokenBalances.tokenBalances[0].token.name : ''
    }
  },

  computed: {
    selectedCurrency (): TokenBalance | null {
      if (this.tokenBalances.tokenBalances.length <= 0) return null
      const selectedCurrency = this.tokenBalances.tokenBalances.find((tokenBalance: TokenBalance) => tokenBalance.token.name === this.currency)
      return selectedCurrency || null
    },
    amountPlaceholder (): string {
      const availableBalanceForCurrency = this.selectedCurrency && this.selectedCurrency.amount.toString()
      return `${this.$t('transaction.amountPlaceholder')} ${availableBalanceForCurrency} `
    }
  },

  methods: {
    handleSubmit () {
      if (this.meta.valid && this.selectedCurrency) {
        const safeAddress = safelyUnwrapAddress(this.values.recipient)
        const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
        const token = this.selectedCurrency.token
        const validAmount = safeAmount && validateAmountOfType(safeAmount, token)

        if (validAmount) {
          this.$emit('transferTokens', {
            to: safeAddress,
            amount: safeAmount,
            tokenIdentifier: token.rri.toString()
          })
        } else {
          this.setErrors({
            amount: this.$t('validations.amountOfType', { granularity: token.granularity.toString() })
          })
        }
      }
    }
  },

  emits: ['transferTokens']
})

export default WalletTransaction
</script>
