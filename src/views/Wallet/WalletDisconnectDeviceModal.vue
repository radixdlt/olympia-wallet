<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div class="border bg-rGrayLight">
        <div class="flex items-center justify-center pt-8">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.3682 21.225L7.3061 26.2871C2.06463 31.5286 2.06463 40.0267 7.3061 45.2681C12.5476 50.5096 21.0457 50.5096 26.2871 45.2681L30.3802 41.175M39.8302 31.725L45.2681 26.2871C50.5096 21.0456 50.5096 12.5476 45.2681 7.30609C40.0267 2.06463 31.5286 2.06464 26.2871 7.3061L21.8182 11.775" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M18.0752 3.375L33.8252 50.625" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
          <div class="text-center text-rBlue py-4 text-xl">
            {{ $t('wallet.disconnectDevice') }}
          </div>
      </div>
      <div class="text-center px-14 pt-4 text-rGrayDark">{{ $t('wallet.disconnectDeviceBody') }}</div>
      <div class="px-14 pt-4 flex">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('wallet.disconnectDeviceCancel') }}</AppButtonCancel>
        <ButtonSubmit @click="handleSubmit" :small="true" :disabled="false" class="w-44 ml-auto" >{{ $t('wallet.disconnectDeviceSubmit') }}</ButtonSubmit>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import AppButtonCancel from '@/components/AppButtonCancel.vue'

const WalletDisconnectDeviceModal = defineComponent({
  components: {
    ButtonSubmit,
    AppButtonCancel
  },

  setup () {
    const router = useRouter()
    const {
      setDisconnectDeviceModal,
      forgetDevice,
      connectHardwareWallet,
      hardwareError,
      hideLedgerInteraction
    } = useWallet(router)

    return {
      handleSubmit: () => {
        forgetDevice('need to access this accounts name')
        setDisconnectDeviceModal(false)
      },
      handleClose: () => {
        setDisconnectDeviceModal(false)
      },
      connectHardwareWallet,
      hardwareError,
      hideLedgerInteraction
    }
  }
})

export default WalletDisconnectDeviceModal
</script>
