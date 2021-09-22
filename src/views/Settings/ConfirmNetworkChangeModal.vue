<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md pt-7 px-7 w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div class="text-center">
        <div class="text-center mt-4 text-rRed text-lg">
          {{ $t('settings.networkChangeTitle') }}
        </div>
        <div class="text-center mt-4 mb-4 text-rBlack text-sm px-8">
          {{ $t('settings.networkChangeCopy') }}
        </div>

        <ButtonSubmit @click="$emit('confirm')" class="w-72 mx-auto mt-4" :destructive=true :disabled=false>
          {{ $t('settings.confirm') }}
        </ButtonSubmit>

        <button @click="$emit('cancel')" class="block m-auto pt-4">{{ $t('settings.cancel') }}</button>
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

  emits: ['confirm', 'cancel']
})

export default WalletLedgerDeleteModal
</script>
