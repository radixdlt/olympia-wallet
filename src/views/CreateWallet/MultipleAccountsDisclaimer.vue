<template>
    <div class="bg-rGrayLight text-center pt-8 pb-7">
      <div class="mb-4 flex flex-row justify-center">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
          <path d="M25 14V36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 25H36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="text-rBlue text-2xl font-light px-8">{{ $t('restoreWallet.disclaimerHeader') }}</div>
    </div>

  <div class="text-center">
    <p class="text-justify py-16 px-32">{{ $t('restoreWallet.disclaimerParagraphOne') }}<br><br>
      {{ $t('restoreWallet.disclaimerParagraphTwo') }}</p>
    <ButtonSubmit class="w-50 my-10" :disabled="false" @click="$emit('understood', true) ">
      {{ $t('restoreWallet.disclaimerUnderstandButton') }}
    </ButtonSubmit>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
export default defineComponent({
  components: {
    ButtonSubmit
  },
  setup () {
    const isVisible: Ref<boolean> = ref(true)
    const handleClose = () => {
      isVisible.value = false
    }
    return {
      handleClose,
      isVisible
    }
  },
  emits: ['understood']
})

</script>
