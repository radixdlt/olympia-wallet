<template>
  <button @click.stop="copyText" class="cursor-pointer flex items-center active:text-rBlack outline-none focus:outline-none">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7.5" y="7.5" width="7" height="7" class="stroke-current"/>
      <path d="M13 5H5V13" class="stroke-current"/>
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { useToast } from 'vue-toastification'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'
const ClickToCopy = defineComponent({

  props: {
    address: {
      type: String,
      required: true
    },
    checkForHardwareAddress: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  setup (props) {
    const toast = useToast()
    const router = useRouter()
    const { activeAddress, verifyHardwareWalletAddress, hardwareDevices, setLedgerVerify, setLedgerVerifyWrongAccount } = useWallet(router)
    const { address, checkForHardwareAddress } = toRefs(props)

    const copyText = async () => {
      const potentialHWAddress = hardwareDevices.value.flatMap((v) => v.addresses).find((a) => a.address.toString() === address.value)
      const isActiveAccount = activeAddress.value?.toString() === address.value

      if (!checkForHardwareAddress.value) {
        copyToClipboard(address.value)
        toast.success('Copied to Clipboard')
        return
      }

      if (potentialHWAddress && !isActiveAccount) {
        setLedgerVerifyWrongAccount(true)
        return
      }

      if (!potentialHWAddress && isActiveAccount) {
        copyToClipboard(address.value)
        toast.success('Copied to Clipboard')
        return
      }

      if (isActiveAccount) {
        try {
          await verifyHardwareWalletAddress()
        } catch {
          toast.error('Unable to connect to Ledger')
        }
        return
      }

      copyToClipboard(address.value)
      toast.success('Copied to Clipboard')
    }
    return { copyText }
  }
})

export default ClickToCopy
</script>
