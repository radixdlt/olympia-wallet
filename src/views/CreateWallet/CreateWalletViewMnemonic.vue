<template>
  <div data-ci="create-wallet-view-mnemonic-component">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in mnemonic" :key="i" class="w-1/4 mb-14">
        <span class="w-40 border rounded-full border-rGray leading-tight h-16 justify-center items-center inline-flex">{{word}}</span>
      </div>
    </div>

    <ButtonSubmit @click="$emit('confirm')" :disabled="false" class="w-96">
      {{ $t('createWallet.recoveryButtonOne') }}
    </ButtonSubmit>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

const CreateWalletViewMnemonic = defineComponent({
  components: {
    ButtonSubmit
  },

  props: {
    mnemonic: {
      type: Array as PropType<Array<string>>,
      required: true
    }
  },

  emits: ['confirm']
})

export default CreateWalletViewMnemonic
</script>
