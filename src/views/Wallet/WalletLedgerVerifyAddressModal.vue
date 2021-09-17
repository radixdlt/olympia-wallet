<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black left-0 top-0">
    <div class="h-modalSmall bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <h3 class="font-medium text-rBlack mb-2 w-full">Verify Hardware Wallet Address</h3>
      <div v-if="shouldShowError" class="text-rRed">
        Your Ledger device was not detected. Please attach it you would like to verify your address.
      </div>
      <div v-else class="text-rBlack">
        Please verify this address matches the one currently shown on your Ledger.
      </div>
      <div class="mt-4">
        <div class="bg-translucent-gray rounded-md border border-rGray text-rBlack mb-4 w-full">
          <div class="border-b border-rGray py-5 flex items-center">
            <div class="w-20 text-right text-rGrayDark mr-4">Address</div>
            <div class="flex-1 flex">
              {{ hardwareAddress }}
              <click-to-copy :address="hardwareAddress" class="hover:text-rGreen active:text-rGreenDark ml-1" />
            </div>
          </div>
        </div>
      </div>
      <div class="text-center pt-4">
        <ButtonSubmit @click="$emit('dismissVerify')" class="w-72 mx-auto mt-2" :disabled=false>
          Done
        </ButtonSubmit>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { useToast } from 'vue-toastification'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'

const WalletLedgerVerifyAddressModal = defineComponent({
  components: {
    ButtonSubmit,
    ClickToCopy
  },

  setup () {
    const toast = useToast()
    const router = useRouter()
    const { hardwareAddress, hardwareError } = useWallet(router)
    return { toast, hardwareAddress, hardwareError }
  },

  computed: {
    shouldShowError (): boolean {
      if (!this.hardwareError) { return false }
      return this.hardwareError.message.includes('No device found')
    }
  },

  methods: {
    copyText () {
      if (this.hardwareAddress) {
        copyToClipboard(this.hardwareAddress)
        this.toast.success('Copied to Clipboard')
      }
    }
  },

  emits: ['dismissVerify']
})

export default WalletLedgerVerifyAddressModal
</script>
