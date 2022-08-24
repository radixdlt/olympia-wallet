<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black left-0 top-0">
    <div class="bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <h3 class="font-medium text-rBlack mb-2 w-full">Verify Hardware Wallet Address</h3>
      <div>
        <div v-if="!isMainnet" class="py-2 text-rRed">{{ $t('hardware.nonMainnetDisclaimer') }}</div>
        <div v-else class="text-rBlack">{{ $t('hardware.verificationMessage') }}</div>
        <div class="mt-4">
          <div class="bg-translucent-gray rounded-md border border-rGray text-rBlack mb-4 w-full">
            <div class="py-5 flex items-center">
              <div class="w-20 text-right text-rGrayDark mr-4">{{ $t('hardware.labelAddress') }}</div>
              <div class="flex-1 flex">
                {{ activeAddress?.toString() }}
                <click-to-copy :address="activeAddress?.toString()" class="hover:text-rGreen active:text-rGreenDark ml-1" />
              </div>
            </div>
          </div>
        </div>
        <div class="text-center pt-4">
          <ButtonSubmit
            @click="dismiss()"
            class="w-72 mx-auto mt-2"
            :disabled="false"
          >
            {{ $t('hardware.buttonDone') }}
          </ButtonSubmit>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { useToast } from 'vue-toastification'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { Network } from '@radixdlt/primitives'

const WalletLedgerVerifyAddressModal = defineComponent({
  components: {
    ButtonSubmit,
    ClickToCopy
  },

  setup () {
    const toast = useToast()
    const router = useRouter()
    const { setLedgerVerify, setLedgerVerifyWrongAccount, activeAddress, activeNetwork } = useWallet(router)
    const isMainnet: ComputedRef<boolean> = computed(() => activeNetwork.value === Network.MAINNET)

    const copyText = () => {
      if (!activeAddress.value) return
      copyToClipboard(activeAddress.toString())
      toast.success('Copied to Clipboard')
    }

    const dismiss = () => {
      setLedgerVerify(false)
      setLedgerVerifyWrongAccount(false)
    }

    return {
      activeAddress,
      isMainnet,
      copyText,
      dismiss,
      setLedgerVerify
    }
  }
})

export default WalletLedgerVerifyAddressModal
</script>
