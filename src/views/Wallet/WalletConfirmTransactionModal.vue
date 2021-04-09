<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="bg-white rounded-md py-7 px-5 w-full max-w-4xl flex flex-col items-end absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h3 class="font-medium text-rBlack mb-9 w-full">{{ $t('transaction.modalHeading') }}</h3>

      <div class="bg-translucent-gray rounded-md border border-rGray text-rBlack mb-8 w-full">
        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.fromLabel') }}</div>
          <div class="flex-1">{{ activeAddress.toString() }}</div>
        </div>

        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.toLabel') }}</div>
          <div class="flex-1">{{ transferInput.to.toString() }}</div>
        </div>

        <div class="border-b border-rGray py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.amountLabel') }}</div>
          <div class="flex-1"><big-amount :amount="transferInput.amount"></big-amount></div>
        </div>

        <div class="py-7 flex items-center">
          <div class="w-32 text-right text-rGrayDark mr-8">{{ $t('transaction.feeLabel') }}</div>
          <div class="flex-1"><big-amount :amount="transactionFee"></big-amount></div>
        </div>
      </div>

      <div class="flex flex-row justify-end">
        <button
          @click="$emit('cancel')"
          class="inline-flex items-center justify-center px-6 py-5 bg-none border border-rGrayDark text-rGrayDark font-normal leading-snug rounded w-56 mr-6"
        >
          {{ $t('transaction.cancelButton') }}
        </button>

        <button
          @click="$emit('confirm')"
          class="inline-flex items-center justify-center px-6 py-5 bg-none border border-rGreen text-rGreen font-normal leading-snug rounded w-56"
        >
          {{ $t('transaction.confirmButton') }}
        </button>
      </div>
    </div>

    <div
      class="bg-translucent-black w-full h-full"
      @click="$emit('cancel')"
    ></div>
  </div>
</template>

<script lang="ts">
import { AddressT } from '@radixdlt/account'
import { AmountT } from '@radixdlt/primitives'
import { TransferTokensOptions } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import BigAmount from '@/components/BigAmount.vue'

const WalletConfirmTransactionModal = defineComponent({
  components: {
    BigAmount
  },

  props: {
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    },
    transferInput: {
      type: Object as PropType<TransferTokensOptions>,
      required: true
    },
    transactionFee: {
      type: Object as PropType<AmountT>,
      required: true
    }
  },

  emits: ['confirm', 'cancel']
})

export default WalletConfirmTransactionModal
</script>
