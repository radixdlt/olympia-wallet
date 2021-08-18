<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md py-7 px-7 w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div class="text-center">
        <div class="text-center mt-8 text-rRed text-lg">
          Remove this hardware wallet
        </div>
        <div class="text-center mt-4 text-rBlack text-sm px-24">
          This will remove the local reference to your hardware wallet. You can add it back at any time.
        </div>
        <ButtonSubmit @click="$emit('forgetHardwareWallet')" class="w-72 mx-auto mt-4" :destructive=true :disabled=false>
          Delete
        </ButtonSubmit>

        <button @click="$emit('closeLedgerDeleteModal')" class="block m-auto pt-4"> Close this </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

const WalletLedgerDeleteModal = defineComponent({

  components: {
    ButtonSubmit
  },

  emits: ['forgetHardwareWallet', 'closeLedgerDeleteModal']
})

export default WalletLedgerDeleteModal
</script>
