<template>
  <AppModal
    :visible="true"
    :title="$t('wallet.ledgerModal.title')"
  >
    <template v-slot:icon>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="transform rotate-45">
      <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
      <path d="M25 14V36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 25H36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </template>
    <template v-slot:content>
      <p class="mb-5">{{ $t('wallet.ledgerModal.disconnectedContent') }}</p>
      <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('wallet.ledgerModal.buttonText') }}</AppButtonCancel>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppModal from '@/components/AppModal.vue'
const WalletLedgerDisconnectedModal = defineComponent({
  components: {
    AppModal,
    AppButtonCancel
  },
  props: {
    handleClose: {
      type: Function,
      required: true
    }
  }
})
export default WalletLedgerDisconnectedModal
</script>
