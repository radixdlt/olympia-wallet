<template>
  <div data-ci="create-wallet-view-mnemonic-component">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in mnemonic" :key="i" class="w-1/4 mb-14">
        <span class="w-40 border rounded-full border-rGray leading-tight h-16 justify-center items-center inline-flex">{{word}}</span>
      </div>
    </div>

    <button
      @click="$emit('confirm')"
      type="button"
      class="inline-flex items-center justify-center px-6 py-5 bg-rGreen border border-rGreen text-white font-normal leading-snug rounded"
    >
      I've written down my recovery phrase
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

const CreateWalletViewMnemonic = defineComponent({
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
