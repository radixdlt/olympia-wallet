<template>
  <div data-ci="wallet-view" class="flex flex-row h-screen relative">
    <wallet-sidebar />

    <router-view v-if="walletLoaded"/>
    <wallet-loading v-else />

    <wallet-confirm-transaction-modal v-if="shouldShowConfirmation" />
    <wallet-ledger-verify-address-modal v-if="showLedgerVerify" @dismissVerify="showLedgerVerify = false" />
    <wallet-ledger-interaction-modal v-if="hardwareInteractionState && hardwareInteractionState.length > 0" />
    <wallet-ledger-delete-modal v-if="showDeleteHWWalletPrompt" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import WalletConfirmTransactionModal from './WalletConfirmTransactionModal.vue'
import WalletSidebar from './WalletSidebar.vue'
import WalletLedgerInteractionModal from '@/views/Wallet/WalletLedgerInteractionModal.vue'
import WalletLoading from './WalletLoading.vue'
import WalletLedgerVerifyAddressModal from '@/views/Wallet/WalletLedgerVerifyAddressModal.vue'
import WalletLedgerDeleteModal from '@/views/Wallet/WalletLedgerDeleteModal.vue'
import { useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useRadix, useTransactions, useWallet } from '@/composables'

const WalletIndex = defineComponent({
  components: {
    WalletConfirmTransactionModal,
    WalletSidebar,
    WalletLedgerInteractionModal,
    WalletLedgerVerifyAddressModal,
    WalletLedgerDeleteModal,
    WalletLoading
  },

  setup () {
    const router = useRouter()

    const { radix } = useRadix()
    const {
      activeAccount,
      hardwareAccount,
      hardwareInteractionState,
      hasWallet,
      showDeleteHWWalletPrompt,
      showLedgerVerify,
      walletLoaded,
      hardwareAccountFailedToSign,
      waitUntilAllLoaded
    } = useWallet(radix, router)

    const { shouldShowConfirmation, transactionUnsub } = useTransactions(radix, router, activeAccount.value, hardwareAccount.value, {
      ledgerSigningError: () => {
        hardwareAccountFailedToSign()
      }
    })

    onBeforeRouteUpdate(async () => {
      await waitUntilAllLoaded()
      return true
    })

    onBeforeRouteLeave(() => {
      transactionUnsub()
    })

    // Return home if wallet is undefined
    if (!hasWallet.value) router.push('/')

    window.ipcRenderer.on('resetToHome', () => {
      radix.__reset()
      router.push({ name: 'Home', query: { modal: '' } })
    })

    return {
      hardwareInteractionState,
      hasWallet,
      shouldShowConfirmation,
      showDeleteHWWalletPrompt,
      showLedgerVerify,
      walletLoaded
    }
  }
})

export default WalletIndex
</script>
