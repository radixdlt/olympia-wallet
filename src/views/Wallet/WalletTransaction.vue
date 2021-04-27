<template>
  <div class="flex flex-col flex-1 min-w-0 overflow-y-scroll bg-rGrayLightest">
    <div class="py-6 px-8 bg-gray h-full">
      <div class="flex justify-between mb-16">
        <h3 class="font-medium text-rBlack">{{ $t('transaction.transactionHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm">
          <span class="text-rBlack mr-4">{{ $t('wallet.currentAddress') }} {{ activeAddress.toString() }}</span>
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
                  v-for="token in tokenBalances"
                  :key="token.token.name"
                  :value="token.token.name"
                >
                  {{ token.token.symbol.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>

          <div v-show="messagesEnabled" class="border-b border-rGray  py-7 flex items-center">
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
            <div class="flex-1 text-2xl font-light">—</div>
          </div>
        </div>

        <ButtonSubmit :disabled="false" class="w-52 ml-full">
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
import { AccountAddressT } from '@radixdlt/account'
import { defineComponent, PropType } from 'vue'
import { safelyUnwrapAddress, safelyUnwrapAmount, validateAmountOfType, validateGreaterThanZero } from '@/helpers/validateRadixTypes'
import { TokenBalance } from '@radixdlt/application'
import { useForm } from 'vee-validate'
import ClickToCopy from '@/components/ClickToCopy.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { asBigNumber } from '@/components/BigAmount.vue'

interface TransactionForm {
  recipient: string;
  amount: number;
  message: string;
}

const WalletTransaction = defineComponent({
  components: {
    ButtonSubmit,
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
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    tokenBalances: {
      type: Object as PropType<Array<TokenBalance>>,
      required: true,
      default: []
    }
  },

  data () {
    return {
      currency: this.tokenBalances.length > 0 ? this.tokenBalances[0].token.name : '',
      messagesEnabled: false
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
    }
  },

  methods: {
    handleSubmit () {
      if (this.meta.valid && this.selectedCurrency) {
        const safeAddress = safelyUnwrapAddress(this.values.recipient)
        const safeAmount = safelyUnwrapAmount(Number(this.values.amount))
        const token = this.selectedCurrency.token
        const validAmount = safeAmount && validateAmountOfType(safeAmount, token)
        console.log('my token', token)

        if (!validAmount) {
          this.setErrors({
            amount: this.$t('validations.amountOfType', { granularity: token.granularity.toString() })
          })
        } else {
          this.$emit('transferTokens', {
            to: safeAddress,
            amount: safeAmount,
            tokenIdentifier: token.rri.toString()
          })
        }
      }
    }
  },

  emits: ['transferTokens']
})

export default WalletTransaction
</script>
