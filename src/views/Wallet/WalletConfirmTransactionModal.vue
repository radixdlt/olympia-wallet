<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <form
      class="bg-white rounded-md py-7 px-5 w-full max-w-4xl flex flex-col items-end absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      @submit.prevent="handleConfirm"
    >
      <h3 class="font-medium text-rBlack mb-9 w-full">{{ $t('transaction.modalHeading') }}</h3>

      <div class="bg-translucent-gray rounded-md border border-rGray text-rBlack mb-8 w-full">
        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.fromLabel') }}</div>
          <div class="flex-1">{{ activeAddress.toString() }}</div>
        </div>

        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.toLabel') }}</div>
          <div class="flex-1">{{ toContent }}</div>
        </div>

        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.amountLabel') }}</div>
          <div class="flex-1 flex flex-row items-center">
            <big-amount :amount="amount" class="mr-4" />
            <token-symbol>{{ selectedCurrency.token.symbol }}</token-symbol>
          </div>
        </div>

        <div class="py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.feeLabel') }}</div>
          <div class="flex-1 flex flex-row items-center">
            <big-amount :amount="transactionFee" class="mr-4" />
            <token-symbol>XRD</token-symbol>
          </div>
        </div>
      </div>

      <pin-input
        name="pin"
        :values="values.pin"
        :autofocus="true"
        class="mb-4 mx-auto"
        data-ci="confirmation-pin"
        @finished="handleValidatePin"
      >
      </pin-input>

      <ButtonSubmit class="w-72 mx-auto mt-5" :disabled="disableSubmit">
        {{ $t('transaction.confirmButton') }}
      </ButtonSUbmit>

      <button
        class="text-rGrayDark py-4 px-4text-sm mx-auto"
        @click="canCancel && $emit('cancel')"
      >
        {{ $t('transaction.cancelButton') }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { AccountAddressT } from '@radixdlt/account'
import { AmountOrUnsafeInput, AmountT } from '@radixdlt/primitives'
import { StakeTokensInput, Token, TransferTokensInput } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import BigAmount from '@/components/BigAmount.vue'
import PinInput from '@/components/PinInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { validatePin } from '@/actions/vue/create-wallet'
import TokenSymbol from '@/components/TokenSymbol.vue'

interface ConfirmationForm {
  pin: string;
}

const WalletConfirmTransactionModal = defineComponent({
  components: {
    BigAmount,
    ButtonSubmit,
    PinInput,
    TokenSymbol
  },

  setup () {
    const { errors, meta, values, setErrors } = useForm<ConfirmationForm>()

    return { errors, meta, values, setErrors }
  },

  props: {
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    transferInput: {
      type: Object as PropType<TransferTokensInput>,
      required: true
    },
    stakeInput: {
      type: Object as PropType<StakeTokensInput>,
      required: true
    },
    transactionFee: {
      type: Object as PropType<AmountT>,
      required: true
    },
    selectedCurrency: {
      type: Object as PropType<Token>,
      required: true
    }
  },

  data () {
    return {
      canCancel: true
    }
  },

  computed: {
    toContent (): string {
      return this.transferInput.to ? this.transferInput.to.toString() : this.stakeInput.validator.toString()
    },
    amount (): AmountOrUnsafeInput {
      return this.transferInput.amount ? this.transferInput.amount : this.stakeInput.amount
    },
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    handleConfirm () {
      this.canCancel = false
      this.$emit('confirm')
    },
    handleValidatePin () {
      validatePin(this.values.pin)
        .then((isValid: boolean) => {
          if (!isValid) {
            this.setErrors({
              pin: this.$t('validations.invalidPin')
            })
          }
        })
    }
  },

  emits: ['confirm', 'cancel']
})

export default WalletConfirmTransactionModal
</script>
