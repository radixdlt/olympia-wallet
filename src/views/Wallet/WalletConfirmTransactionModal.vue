<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modal bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div v-if="transactionState === 'building'">
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            Building Transaction...
          </div>
          <button
            class="text-rGrayDark py-4 px-4 text-sm mx-auto mt-4"
            @click="canCancel && $emit('cancel')"
          >
            {{ $t('transaction.cancelButton') }}
          </button>
        </div>
      </div>
      <div v-if="transactionState === 'submitting'">
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            Submitting Transaction...
          </div>
        </div>
      </div>
      <form
        v-if="transactionState === 'confirm'"
        class="flex flex-col items-end"
        @submit.prevent="handleConfirm"
      >
        <h3 class="font-medium text-rBlack mb-4 w-full">{{ $t('transaction.modalHeading') }}</h3>

        <div class="bg-translucent-gray rounded-md border border-rGray text-rBlack mb-4 w-full">
          <div class="border-b border-rGray py-5 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ fromLabel }}</div>
            <div class="flex-1">{{ activeAddress.toString() }}</div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ toLabel }}</div>
            <div class="flex-1">{{ toContent }}</div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ $t('transaction.amountLabel') }}</div>
            <div class="flex-1 flex flex-row items-center">
              <big-amount :amount="amount" class="mr-4" />
              <token-symbol>{{ selectedCurrency.token.symbol }}</token-symbol>
            </div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center" v-if="activeMessage">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ $t('transaction.messageLabel') }}</div>
            <div class="flex-1">
              <div class="flex">
                <div class="flex-1 text-sm">
                  {{ activeMessage.plaintext }}
                </div>
                <div class="flex-grow-0" v-if="activeMessage.encrypt">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 mr-3.5">
                    <path d="M2.04883 4.93512V3.79987C2.04883 2.25355 3.30238 1 4.8487 1C6.39502 1 7.64857 2.25355 7.64857 3.79987V4.93512" stroke="#7A99AC" stroke-width="1.5" stroke-miterlimit="10"/>
                    <path d="M1 11.4001V4.84473H2.13447H7.58739H8.72185V11.0556H2.60558" stroke="#7A99AC" stroke-width="1.5" stroke-miterlimit="10"/>
                  </svg>

                </div>
              </div>
            </div>
          </div>

          <div class="py-4 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-8">{{ $t('transaction.feeLabel') }}</div>
            <div class="flex-1 flex flex-row items-center">
              <big-amount :amount="transactionFee" class="mr-4" />
              <token-symbol>{{ nativeToken.symbol }}</token-symbol>
            </div>
          </div>
        </div>

        <h3 class="font-medium text-rBlack text-center w-full mb-4">{{ $t('transaction.enterPin') }}</h3>
        <pin-input
          name="pin"
          :values="values.pin"
          :autofocus="true"
          class="mx-auto"
          data-ci="confirmation-pin"
          @finished="handleValidatePin"
          @unfinished="handleUnfinishedPin"
        >
        </pin-input>
        <div class="flex justify-end items-center mt-4">
          <button
            class="text-rGrayDark py-4 px-4text-sm mx-auto mr-8"
            @click="canCancel && $emit('cancel')"
          >
            {{ $t('transaction.cancelButton') }}
          </button>

          <ButtonSubmit class="w-72 mx-auto mt-2" :disabled="disableSubmit">
            {{ $t('transaction.confirmButton') }}
          </ButtonSUbmit>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { AccountAddressT, AmountOrUnsafeInput, AmountT, MessageInTransaction, StakeTokensInput, Token, TokenBalance, TransferTokensInput } from '@radixdlt/application'
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

  setup (props) {
    const { errors, meta, values, setErrors, resetForm } = useForm<ConfirmationForm>()

    console.log('here', props)

    return { errors, meta, values, setErrors, resetForm }
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
      type: Object as PropType<TokenBalance>,
      required: true
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: true
    },
    transactionState: {
      type: String,
      required: true
    },
    activeMessage: {
      type: Object as PropType<MessageInTransaction>,
      required: false
    },
    confirmationMode: {
      type: String,
      required: false,
      default: 'transfer'
    }
  },

  data () {
    return {
      canCancel: true,
      isValidPin: false
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
      return !this.isValidPin
    },

    fromLabel (): string {
      return this.$t(`confirmation.${this.confirmationMode}FromLabel`)
    },

    toLabel (): string {
      return this.$t(`confirmation.${this.confirmationMode}ToLabel`)
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
          this.isValidPin = isValid
          if (!isValid) {
            this.resetForm()
            this.setErrors({
              pin: this.$t('validations.invalidPin')
            })
          }
        })
    },
    handleUnfinishedPin () {
      this.isValidPin = false
    }
  },

  emits: ['confirm', 'cancel']
})

export default WalletConfirmTransactionModal
</script>
