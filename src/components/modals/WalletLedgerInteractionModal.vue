<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md py-7 px-7 w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div>
        <div class="mt-16">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
          </svg>
          <div class="text-center mt-8 text-rGrayDark text-lg">
            {{interactionTitle}}
          </div>
          <div v-if="showLedgerInteractionModalBody" class="text-center mt-4 text-rBlack text-sm">
            {{interactionBody}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import { useI18n } from 'vue-i18n'

const WalletLedgerInteractionModal = defineComponent({

  setup () {
    const router = useRouter()
    const { t } = useI18n()
    const {
      hideLedgerInteraction,
      cancelTransaction,
      hardwareInteractionState,
      showLedgerInteractionModalBody,
      isSoftwareAccount
    } = useWallet(router)

    isSoftwareAccount()

    const interactionTitle: ComputedRef<string> = computed(() => {
      if (hardwareInteractionState.value === '') return ''
      return t(`wallet.ledgerInteractionState.${hardwareInteractionState.value}.title`)
    })

    const interactionBody: ComputedRef<string> = computed(() => {
      if (hardwareInteractionState.value === '') return ''
      return t(`wallet.ledgerInteractionState.${hardwareInteractionState.value}.body`)
    })

    return {
      hideLedgerInteraction,
      interactionTitle,
      interactionBody,
      showLedgerInteractionModalBody,
      close () {
        hideLedgerInteraction()
        cancelTransaction()
      }
    }
  }
})

export default WalletLedgerInteractionModal
</script>
