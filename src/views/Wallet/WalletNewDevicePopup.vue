<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center">
    <div class="bg-white rounded-md w-72 absolute top-2/3 left-1/4 transform -translate-x-1/3 -translate-y-1/2 border border-rBlue bg-rGrayLight">
      <div class="text-center px-2 pt-4 text-rGrayDark">{{ $t('wallet.newHardwareAccountBody') }}</div>
      <div class="py-2 flex justify-center">
        <AppButtonSubmit @click="handleClose" class="w-1/2 ">{{ $t('wallet.newHardwareAccountConfirm') }}</AppButtonSubmit>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import AppButtonSubmit from '@/components/AppButtonSubmit.vue'

const WalletNewDevicePopup = defineComponent({
  components: {
    AppButtonSubmit
  },

  setup () {
    const router = useRouter()
    const {
      setShowNewDevicePopup
    } = useWallet(router)

    return {
      handleClose: () => {
        setShowNewDevicePopup(false)
      }
    }
  }
})

export default WalletNewDevicePopup
</script>
