<template>
  <div data-ci="wallet-view" class="flex flex-row h-screen relative">
    <wallet-sidebar/>
    <div class="flex flex-col w-full">
      <slot v-if="hasWallet"/>
      <wallet-loading v-else />
      <div class="bg-white p-5 flex flex-row items-center justify-center border-t border-rRed">
        <div>
          <svg width="36" height="30" viewBox="0 0 36 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
            <path d="M15.2687 2.11167L1.74022 24.5C1.46129 24.9788 1.31371 25.5217 1.31215 26.0747C1.31058 26.6276 1.4551 27.1713 1.73132 27.6517C2.00753 28.132 2.40582 28.5324 2.88656 28.8128C3.36729 29.0932 3.91372 29.2439 4.47147 29.25H31.5284C32.0862 29.2439 32.6326 29.0932 33.1133 28.8128C33.5941 28.5324 33.9923 28.132 34.2686 27.6517C34.5448 27.1713 34.6893 26.6276 34.6877 26.0747C34.6862 25.5217 34.5386 24.9788 34.2597 24.5L20.7312 2.11167C20.4465 1.64634 20.0455 1.26161 19.5671 0.9946C19.0887 0.727594 18.549 0.587323 17.9999 0.587323C17.4509 0.587323 16.9112 0.727594 16.4328 0.9946C15.9543 1.26161 15.5534 1.64634 15.2687 2.11167V2.11167Z" stroke="#EF4136" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 22.9167H18.0203" stroke="#EF4136" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 10V18" stroke="#EF4136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="max-w-2xl" v-if="isTestNet">{{ $t('wallet.testNetworkDisclaimer') }}</div>
        <div v-else>The Radix Network has completed its Babylon update. This wallet application will not be updated, and cannot show you current balances or perform transactions.
          <button class="font-medium" @click="transitionToExport">Click here to export your accounts</button> for use in the new <a href="https://wallet.radixdlt.com/" target="_blank" class="font-medium">Radix Wallet for Babylon.</a>
        </div>
      </div>
    </div>
    <wallet-confirm-transaction-modal v-if="shouldShowConfirmation" />
    <wallet-ledger-verify-address-modal v-if="showLedgerVerify && !hardwareError" />
    <wallet-ledger-verify-error-modal v-if="ledgerVerifyError" />
    <wallet-ledger-interaction-modal v-if="hardwareInteractionState && hardwareInteractionState.length > 0 && hardwareInteractionState != 'error' && showDerivingModal"/>
    <wallet-ledger-disconnected-modal
      :handleClose="closeModal"
      :hardwareError="hardwareError"
      v-if="hardwareError"/>
    <wallet-ledger-delete-modal v-if="showDeleteHWWalletPrompt" />
    <wallet-hide-account-modal v-if="showHideAccountModal"/>
    <wallet-disconnect-device-modal v-if="showDisconnectDeviceModal"/>
    <wallet-new-device-modal v-if="showNewDevicePopup"/>
    <wallet-update-modal v-if="updateInProcess"/>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue'
import WalletSidebar from './WalletSidebar.vue'
import WalletLoading from './WalletLoading.vue'

import WalletConfirmTransactionModal from '@/components/modals/WalletConfirmTransactionModal.vue'
import WalletDisconnectDeviceModal from '@/components/modals/WalletDisconnectDeviceModal.vue'
import WalletHideAccountModal from '@/components/modals/WalletHideAccountModal.vue'
import WalletLedgerDeleteModal from '@/components/modals/WalletLedgerDeleteModal.vue'
import WalletLedgerDisconnectedModal from '@/components/modals/WalletLedgerDisconnectedModal.vue'
import WalletLedgerInteractionModal from '@/components/modals/WalletLedgerInteractionModal.vue'
import WalletLedgerVerifyAddressModal from '@/components/modals/WalletLedgerVerifyAddressModal.vue'
import WalletLedgerVerifyErrorModal from '@/components/modals/WalletLedgerVerifyErrorModal.vue'
import WalletNewDeviceModal from '@/components/modals/WalletNewDeviceModal.vue'
import WalletUpdateModal from '@/components/modals/WalletUpdateModal.vue'

import { useSettingsTab, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
const WalletIndex = defineComponent({
  components: {
    WalletConfirmTransactionModal,
    WalletDisconnectDeviceModal,
    WalletHideAccountModal,
    WalletLedgerDeleteModal,
    WalletLedgerDisconnectedModal,
    WalletLedgerInteractionModal,
    WalletLedgerVerifyAddressModal,
    WalletLedgerVerifyErrorModal,
    WalletLoading,
    WalletNewDeviceModal,
    WalletSidebar,
    WalletUpdateModal
  },

  setup () {
    const router = useRouter()
    const {
      activeNetwork,
      hardwareError,
      hardwareInteractionState,
      hasWallet,
      ledgerVerifyError,
      radix,
      shouldShowConfirmation,
      showDeleteHWWalletPrompt,
      showDisconnectDeviceModal,
      showHideAccountModal,
      showDerivingModal,
      showLedgerVerify,
      showNewDevicePopup,
      updateInProcess,

      closeLedgerErrorModal,
      cancelTransaction,
      walletLoaded
    } = useWallet(router)

    const { setTab } = useSettingsTab()

    window.ipcRenderer.on('resetToHome', () => {
      radix.__reset()
      router.push({ name: 'Home', query: { modal: '' } })
    })

    const isTestNet = computed(() => {
      return activeNetwork.value && activeNetwork.value !== 'mainnet'
    })

    const closeModal = () => {
      closeLedgerErrorModal()
      cancelTransaction()
    }

    const transitionToExport = () => {
      router.push({ name: 'Settings' })
      setTab('export')
    }

    return {
      activeNetwork,
      hardwareError,
      hardwareInteractionState,
      hasWallet,
      isTestNet,
      ledgerVerifyError,
      shouldShowConfirmation,
      showDeleteHWWalletPrompt,
      showDerivingModal,
      showDisconnectDeviceModal,
      showHideAccountModal,
      showLedgerVerify,
      showNewDevicePopup,
      updateInProcess,
      walletLoaded,
      closeModal,
      transitionToExport
    }
  }
})

export default WalletIndex
</script>
