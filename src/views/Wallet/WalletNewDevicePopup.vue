<template>
  <div class="absolute bottom-24 ml-64 z-40 flex items-center justify-center opacity-100">
    <svg width="340" height="150" viewBox="0 0 340 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="path-1-inside-1_65_4" fill="white">
        <path fill-r ule="evenodd" clip-rule="evenodd" d="M17.8453 0H0L17.8453 19.38V144C17.8453 147.314 20.5316 150 23.8453 150H334C337.314 150 340 147.314 340 144V6C340 2.68629 337.314 0 334 0H18.7845H17.8453Z"/>
      </mask>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.8453 0H0L17.8453 19.38V144C17.8453 147.314 20.5316 150 23.8453 150H334C337.314 150 340 147.314 340 144V6C340 2.68629 337.314 0 334 0H18.7845H17.8453Z" fill="#F2F2FC"/>
      <path d="M0 0V-1H-2.28018L-0.735634 0.677379L0 0ZM17.8453 19.38H18.8453V18.9897L18.5809 18.7026L17.8453 19.38ZM0 1H17.8453V-1H0V1ZM18.5809 18.7026L0.735634 -0.677379L-0.735634 0.677379L17.1097 20.0574L18.5809 18.7026ZM18.8453 144V19.38H16.8453V144H18.8453ZM23.8453 149C21.0839 149 18.8453 146.761 18.8453 144H16.8453C16.8453 147.866 19.9793 151 23.8453 151V149ZM334 149H23.8453V151H334V149ZM339 144C339 146.761 336.761 149 334 149V151C337.866 151 341 147.866 341 144H339ZM339 6V144H341V6H339ZM334 1C336.761 1 339 3.23858 339 6H341C341 2.134 337.866 -1 334 -1V1ZM18.7845 1H334V-1H18.7845V1ZM17.8453 1H18.7845V-1H17.8453V1Z" fill="#7A99AC" mask="url(#path-1-inside-1_65_4)"/>
    </svg>
    <p class="ml-4 pb-12 w-60 text-center fixed text-rGrayDark">{{ $t('wallet.newHardwareAccountBody') }}</p>
    <div class="fixed bg-rGreen z-40 mt-20 border-2 py-2 px-14 rounded-md">
      <AppButtonSubmit @click="handleClose" class="text-white">{{ $t('wallet.newHardwareAccountConfirm') }}</AppButtonSubmit>
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
