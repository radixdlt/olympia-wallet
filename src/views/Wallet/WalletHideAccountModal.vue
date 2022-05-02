<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div class="border bg-rGrayLight">
        <div class="flex items-center justify-center pt-8">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.2273 8.36363C22.7917 7.99744 24.3933 7.8144 26 7.81817C41.9091 7.81817 51 26 51 26C49.6204 28.5809 47.9751 31.0108 46.0909 33.25M39.5 39.5C35.615 42.4614 30.8843 44.102 26 44.1818C10.0909 44.1818 1 26 1 26C3.82702 20.7316 7.74803 16.1286 12.5 12.5L39.5 39.5Z" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 1L51 51" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M32.7993 32.7989C31.9064 33.6918 30.8464 34.4 29.6798 34.8832C28.5132 35.3665 27.2629 35.6152 26.0001 35.6152C24.7374 35.6152 23.4871 35.3665 22.3205 34.8832C21.1539 34.4 20.0939 33.6918 19.201 32.7989C18.3082 31.906 17.5999 30.846 17.1167 29.6794C16.6335 28.5128 16.3848 27.2625 16.3848 25.9998C16.3848 24.7371 16.6335 23.4867 17.1167 22.3201C17.5999 21.1535 18.3082 20.0936 19.201 19.2007" stroke="#052CC0" stroke-width="1.5"/>
            <path d="M23.813 16.6364C25.3962 16.2667 27.0473 16.3045 28.612 16.7462C30.1766 17.1879 31.6037 18.0191 32.7598 19.1622C33.916 20.3052 34.7634 21.7228 35.2229 23.2823C35.6824 24.8418 35.739 26.4924 35.3873 28.0797" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
          <div class="text-center text-rBlue py-4 text-xl">
            Hide Account
          </div>
      </div>
      <div class="text-center px-14 pt-4 text-rGrayDark">{{ $t('wallet.hideSoftwareAccountModalBody') }}</div>
      <div class="px-14 pt-4 flex">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('wallet.hideAccountModalCancel') }}</AppButtonCancel>
        <ButtonSubmit @click="handleSubmit" :small="true" :disabled="false" class="w-44 ml-auto" >{{ $t('wallet.hideAccountModalSubmit') }}</ButtonSubmit>
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

const WalletHideAccountModal = defineComponent({
  components: {
    ButtonSubmit,
    AppButtonCancel
  },

  setup () {
    const router = useRouter()
    const {
      setDisconnectDeviceModal
    } = useWallet(router)

    return {
      handleSubmit: () => {
        // remove device from store
        setDisconnectDeviceModal(false)
      },
      handleClose: () => {
        setDisconnectDeviceModal(false)
      }
    }
  }
})

export default WalletHideAccountModal
</script>
