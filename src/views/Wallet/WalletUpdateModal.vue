<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-rGrayLight rounded-md w-full h-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2" v-if="true">
      <div class="bg-rGrayLight rounded-md">
         <div class=" bg-rGrayLight h-full flex flex-col flex-1 rounded-md w-full justify-around pt-10 pb-2">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
              <path d="M31.9037 2.01416C35.7403 3.16648 39.2274 5.2608 42.0472 8.1062C44.867 10.9516 46.9296 14.4576 48.0472 18.3044" stroke="#052CC0" stroke-width="1.5"/>
              <path d="M49 25C49 29.7468 47.5924 34.3869 44.9553 38.3337C42.3181 42.2805 38.5698 45.3566 34.1844 47.1731C29.799 48.9896 24.9734 49.4649 20.3178 48.5388C15.6623 47.6128 11.3859 45.327 8.02944 41.9706C4.67298 38.6141 2.3872 34.3377 1.46115 29.6822C0.535108 25.0266 1.01039 20.201 2.82689 15.8156C4.64339 11.4302 7.71954 7.68188 11.6663 5.04473C15.6131 2.40758 20.2532 1 25 1" stroke="#00C389" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="text-center text-rBlue py-4 text-2xl">
            {{ $t('wallet.downloadingUpdate') }}
          </div>
      </div>
      <div class="text-center px-20 pt-6 text-rGrayDark">{{ $t('wallet.downloadingUpdateBody') }}</div>
    </div>
    <div class="h-modalSmall bg-white rounded-md w-full h-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2" v-else>
      <div class="bg-rGrayLight">
        <div class="pt-10">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto pt">
            <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
            <path d="M37 18L20.5 35L13 27.2727" stroke="#052CC0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
          <div class="text-center text-rBlue pt-4 pb-6 text-2xl">
            {{ $t('wallet.updatesDownloaded') }}
          </div>
      </div>
      <div class="text-center px-14 pt-6 text-rGrayDark">{{ $t('wallet.restartBody') }}</div>
      <div class="px-14 pt-6 flex bg-white">
        <ButtonSubmit @click="handleSubmit" :small="true" :disabled="false" class="w-44 mx-auto" >{{ $t('wallet.restart') }}</ButtonSubmit>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'

const WalletUpdateModal = defineComponent({
  components: {
    ButtonSubmit
  },

  setup () {
    const router = useRouter()
    const {
      setDisconnectDeviceModal
    } = useWallet(router)

    return {
      handleSubmit: () => {
        setDisconnectDeviceModal(-1)
      },
      handleClose: () => {
        setDisconnectDeviceModal(-1)
      }
    }
  }
})

export default WalletUpdateModal
</script>
