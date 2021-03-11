<template>
  <div data-ci="create-wallet-view-mnemonic-component">
    <p class="mb-4">
      The following 12 words are the seed of your new account. As long as you have them, you will always be able to recover your account, but remember not to store them digitally.
    </p>

    <div class="flex flex-wrap mb-4">
      <span v-for="(word, i) in mnemonic" :key="i" class="w-1/6">{{word}}</span>
    </div>

    <button
      @click="$emit('confirm')"
      type="button"
      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      I have written down my recovery phrase
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
