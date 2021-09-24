<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalMedium bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
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
            @click="canCancel && closeModal()"
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
      <div v-if="transactionState === 'hw-signing'">
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            Please confirm and sign the transaction on your Ledger.
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
            <div class="flex-1 font-mono text-sm">{{ activeAddress.toString() }}</div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ toLabel }}</div>
            <div class="flex-1 font-mono text-sm">{{ toContent }}</div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ $t('transaction.amountLabel') }}</div>
            <div class="flex-1 flex flex-row items-center">
              <big-amount :amount="amount" class="mr-1" />
              <span class="uppercase" v-if="stakeInput && nativeToken">{{ nativeToken.symbol }}</span>
              <span class="uppercase" v-else>{{ selectedCurrency.token.symbol }}</span>
            </div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center" v-if="activeMessageInTransaction && !this.stakeInput">
            <div class="w-26 text-right text-rGrayDark mr-6">{{ $t('transaction.messageLabel') }}</div>
            <div class="flex-1">
              <div class="flex">
                <div class="flex-1 text-sm">
                  {{ activeMessageInTransaction.plaintext }}
                </div>
                <div class="flex-grow-0" v-if="activeMessageInTransaction.encrypt">
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
            <div class="flex-1 flex flex-row items-center" v-if="transactionFee">
              <big-amount :amount="transactionFee"  class="mr-1" />
              <span class="uppercase" v-if="nativeToken">{{ nativeToken.symbol }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-start justify-between w-full mt-1">
          <div class="flex items-start justify-start mt-1 flex-1">
            <div class="font-light text-rGrayDark bg-rGrayLight border border-rGray py-2 pl-4 pr-5 rounded text-base w-30">
              <span>{{ $t('transaction.enterPin') }}</span>
            </div>
            <pin-input
              name="pin"
              :values="values.pin"
              :autofocus="true"
              :shiftErrorLeft="true"
              class="-ml-2 flex-1"
              data-ci="confirmation-pin"
              @finished="handleValidatePin"
              @unfinished="handleUnfinishedPin"
            />
          </div>
          <div class="flex justify-end items-center">
            <div
              class="text-rGrayDark py-3 px-4 text-base mx-auto mr-4 cursor-pointer"
              @click="canCancel && closeModal()"
            >
              {{ $t('transaction.cancelButton') }}
            </div>

            <ButtonSubmit class="w-44 py-3" :disabled="disableSubmit" :small="true" >
              {{ $t('transaction.confirmButton') }}
            </ButtonSubmit>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { AmountOrUnsafeInput } from '@radixdlt/application'
import { defineComponent, ref, onMounted, onUnmounted, computed, ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import BigAmount from '@/components/BigAmount.vue'
import PinInput from '@/components/PinInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { validatePin } from '@/actions/vue/create-wallet'
import { useRouter } from 'vue-router'
import { useNativeToken, useHomeModal, useTransactions, useWallet } from '@/composables'
import { useI18n } from 'vue-i18n'

interface ConfirmationForm {
  pin: string;
}

const WalletConfirmTransactionModal = defineComponent({
  components: {
    BigAmount,
    ButtonSubmit,
    PinInput
  },

  setup () {
    const { errors, meta, values, setErrors, resetForm } = useForm<ConfirmationForm>()
    const { setModal } = useHomeModal()
    const router = useRouter()

    const canCancel = ref(true)
    const isValidPin = ref(false)
    const pinAttempts = ref(0)
    const { t } = useI18n({ useScope: 'global' })

    const {
      activeAddress,
      activeAccount,
      hardwareAccount,
      hardwareAccountFailedToSign,
      radix,
      reset
    } = useWallet(router)
    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)

    const {
      activeMessageInTransaction,
      cancelTransaction,
      confirmationMode,
      confirmTransaction,
      stakeInput,
      transactionFee,
      transactionState,
      transferInput,
      transactionUnsub,
      selectedCurrency
    } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value, {
      ledgerSigningError: () => {
        hardwareAccountFailedToSign()
      }
    })

    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelTransaction()
      }
    }

    const closeModal = () => {
      cancelTransaction()
    }

    onMounted(() => {
      window.addEventListener('keydown', escapeListener)
    })

    onUnmounted(() => {
      nativeTokenUnsub()
      transactionUnsub()
      window.removeEventListener('keydown', escapeListener)
    })

    const toContent: ComputedRef<string> = computed(() => {
      if (stakeInput.value) {
        return stakeInput.value.validator.toString()
      }
      if (transferInput.value) {
        return transferInput.value.to.toString()
      }
      return ''
    })

    const amount: ComputedRef<AmountOrUnsafeInput> = computed(() => {
      if (stakeInput.value) {
        return stakeInput.value.amount
      }
      if (transferInput.value) {
        return transferInput.value.amount
      }
      return 0
    })

    const disableSubmit: ComputedRef<boolean> = computed(() => {
      return !isValidPin.value
    })

    const fromLabel: ComputedRef<string> = computed(() => {
      return t(`confirmation.${confirmationMode.value}FromLabel`)
    })

    const toLabel: ComputedRef<string> = computed(() => {
      return t(`confirmation.${confirmationMode.value}ToLabel`)
    })

    const handleConfirm = () => {
      canCancel.value = false
      confirmTransaction()
    }

    const handleValidatePin = () => {
      validatePin(values.pin)
        .then((isValid: boolean) => {
          isValidPin.value = isValid
          if (!isValid) {
            resetForm()
            setErrors({
              pin: t('validations.invalidPin')
            })

            pinAttempts.value++
            if (pinAttempts.value === 3) {
              setModal('locked-out')
              router.push('/')
              reset()
            }
          }
        })
    }

    const handleUnfinishedPin = () => {
      isValidPin.value = false
    }

    return {
      activeAddress,
      activeMessageInTransaction,
      amount,
      canCancel,
      closeModal,
      confirmationMode,
      disableSubmit,
      errors,
      fromLabel,
      handleConfirm,
      handleUnfinishedPin,
      handleValidatePin,
      isValidPin,
      meta,
      nativeToken,
      pinAttempts,
      resetForm,
      setErrors,
      stakeInput,
      toContent,
      toLabel,
      transactionFee,
      transactionState,
      transferInput,
      values,
      selectedCurrency
    }
  }
})

export default WalletConfirmTransactionModal
</script>
