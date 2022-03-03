<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalMedium bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div v-if="shouldShowBuildingModal">
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            {{ $t('transaction.buildingMessage') }}
          </div>
          <div class="text-center mt-4 text-rGrayDark text-sm">{{ transactionState }}</div>
          <button
            class="text-rGrayDark py-4 px-4 text-sm mx-auto mt-4"
            @click="canCancel && closeModal()"
          >
            {{ $t('transaction.cancelButton') }}
          </button>
        </div>
      </div>
      <div v-else-if="shouldShowLedgerModal">
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            {{ $t('transaction.confirmMessage') }}
          </div>
        </div>
      </div>
      <form
        v-else-if="transactionState === 'ASKED_FOR_CONFIRMATION'"
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
              <big-amount v-if="!shouldShowMaxUnstakeConfirmation" :amount="amount" class="mr-1" />
              <span v-else class="mr-1">MAX</span>
              <span class="uppercase" v-if="(stakeInput || unstakeInput) && nativeToken">{{ nativeToken.symbol }}</span>
              <span class="uppercase" v-else-if="selectedCurrencyToken">{{ selectedCurrencyToken.symbol }}</span>
            </div>
          </div>

          <div class="border-b border-rGray py-3.5 flex items-center" v-if="activeMessageInTransaction && !this.stakeInput && !this.unstakeInput">
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
            <div class="flex-1 flex flex-row items-center" v-if="transactionFee && !shouldShowMaxUnstakeConfirmation">
              <big-amount :amount="transactionFee"  class="mr-1" />
              <span class="uppercase" v-if="nativeToken">{{ nativeToken.symbol }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="xrdRemainderBalanceBelowTen"
          class="pr-6"
        >
          <span class="text-rRed text-md"><b>{{ $t('transaction.warningTitle') }}:</b> {{ $t('transaction.lessThanTenXRDBalanceWarning') }}</span>
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

            <ButtonSubmit class="w-44 py-3" :disabled="disableSubmit" :small="true" v-on:click="disableEscape" >
              {{ $t('transaction.confirmButton') }}
            </ButtonSubmit>
          </div>
        </div>
      </form>
      <div v-else>
        <div class="bg-white h-full flex flex-col flex-1 w-full justify-around box-border mt-52">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            {{ $t('transaction.submittingMessage') }}
          </div>
          <div class="text-center mt-4 text-rGrayDark text-sm">{{ $t(`confirmation.transactionState.${transactionState}`) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Amount, AmountT, AmountOrUnsafeInput, Token } from '@radixdlt/application'
import { defineComponent, ref, onMounted, onUnmounted, computed, ComputedRef } from 'vue'
import { useForm } from 'vee-validate'
import { merge, interval, Subscription } from 'rxjs'
import BigAmount from '@/components/BigAmount.vue'
import PinInput from '@/components/PinInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { validatePin } from '@/actions/vue/create-wallet'
import { useRouter } from 'vue-router'
import { useNativeToken, useHomeModal, useTransactions, useWallet, useTokenBalances } from '@/composables'
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
      radix,
      reset
    } = useWallet(router)
    const { nativeToken, nativeTokenUnsub } = useNativeToken(radix)
    const { tokenBalances, tokenBalanceFor, tokenInfoFor, tokenBalancesUnsub } = useTokenBalances(radix)

    const updateObservable = merge(
      radix.activeAccount,
      interval(15000)
    )

    const subs = new Subscription()
    const loading = ref(true)

    subs.add(radix.activeAddress.subscribe(() => {
      loading.value = true
    }))

    onUnmounted(() => {
      subs.unsubscribe()
      tokenBalancesUnsub()
    })

    const {
      activeMessageInTransaction,
      cancelTransaction,
      confirmationMode,
      confirmTransaction,
      ledgerState,
      stakeInput,
      shouldShowMaxUnstakeConfirmation,
      unstakeInput,
      transactionFee,
      transactionState,
      transferInput,
      selectedCurrency
    } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value)

    const selectedCurrencyToken: ComputedRef<Token | null> = computed(() => {
      return selectedCurrency.value ? tokenInfoFor(selectedCurrency.value.token_identifier.rri) : null
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
      window.removeEventListener('keydown', escapeListener)
    })

    const disableEscape = () => {
      window.removeEventListener('keydown', escapeListener)
    }

    const toContent: ComputedRef<string> = computed(() => {
      if (stakeInput.value) {
        return stakeInput.value.to_validator.toString()
      } else if (unstakeInput.value) {
        return unstakeInput.value.from_validator.toString()
      } else if (transferInput.value) {
        return transferInput.value.to_account.toString()
      }
      return ''
    })

    const amount: ComputedRef<AmountOrUnsafeInput | undefined> = computed(() => {
      if (stakeInput.value) {
        return stakeInput.value.amount
      } else if (unstakeInput.value) {
        return unstakeInput.value.amount
      } else if (transferInput.value) {
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

    const shouldShowBuildingModal: ComputedRef<boolean> = computed(() =>
      transactionState.value === 'INITIATED' || transactionState.value === 'BUILT_FROM_INTENT'
    )

    // Show ledger modal when hw-signing is in progress and the transaction is CONFIRMED
    // To Do: Need a way to show modal to user who needs to encrypt a hardware message before transaction is INITIATED
    const shouldShowLedgerModal: ComputedRef<boolean> = computed(() =>
      (transactionState.value === 'CONFIRMED') && ledgerState.value === 'hw-signing'
    )

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

    const zero = Amount.fromUnsafe(0)._unsafeUnwrap()

    const totalXRD: ComputedRef<AmountT> = computed(() => {
      if (!tokenBalances.value || !nativeToken.value) return zero
      const nativeTokenBalance = tokenBalanceFor(nativeToken.value)
      if (!nativeTokenBalance) return zero
      return nativeTokenBalance.value
    })

    // Do not check for balance above 10XRD if unstaking. Only run validation if staking/sending. Two possible calculations
    // can occur. Either (Total XRD - Transaction Fee) OR (Total XRD - XRD Amount Input - Transaction Fee). Calculation is
    // based on whether or not User chose to send/stake XRD or another token.
    // Default value is false because we don't want to blindly throw this warning outside of said cases.
    const xrdRemainderBalanceBelowTen: ComputedRef<boolean> = computed(() => {
      // Don't show error if starting total is < 10 xrd
      if (totalXRD.value && Number(totalXRD.value) < Math.pow(10, 19)) {
        return false
      // Check transaction fee doesn't bring total < 10 xrd for non-exd transactioins
      } else if (selectedCurrencyToken.value && selectedCurrencyToken.value.symbol !== 'xrd' && toLabel.value !== 'Unstake from') {
        return Number(totalXRD.value) - Number(transactionFee.value) < Math.pow(10, 19)
      // Check amount and transaction feed don't bring total < 10 xrd
      } else if (totalXRD.value && amount.value && transactionFee && toLabel.value !== 'Unstake from') {
        return Number(totalXRD.value) - Number(amount.value) - Number(transactionFee.value) < Math.pow(10, 19)
      } else {
        return false
      }
    })

    return {
      activeAddress,
      activeMessageInTransaction,
      amount,
      canCancel,
      closeModal,
      confirmationMode,
      disableEscape,
      disableSubmit,
      errors,
      fromLabel,
      handleConfirm,
      handleUnfinishedPin,
      handleValidatePin,
      isValidPin,
      ledgerState,
      meta,
      nativeToken,
      pinAttempts,
      resetForm,
      selectedCurrency,
      selectedCurrencyToken,
      setErrors,
      shouldShowBuildingModal,
      shouldShowLedgerModal,
      shouldShowMaxUnstakeConfirmation,
      stakeInput,
      unstakeInput,
      toContent,
      toLabel,
      transactionFee,
      transactionState,
      transferInput,
      totalXRD,
      values,
      xrdRemainderBalanceBelowTen
    }
  }
})

export default WalletConfirmTransactionModal
</script>
