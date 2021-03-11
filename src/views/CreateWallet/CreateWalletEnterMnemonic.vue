<template>
  <div data-ci="create-wallet-enter-mnemonic-component">
    <button
      @click="$emit('back')"
      type="button"
      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Back
    </button>

    <p class="mb-4">
      Please enter your 12-word mnemonic. The words must be in the correct order.
    </p>

    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in mnemonic" :key="i" class="w-1/6">
        <mnemonic-input
          :required-words="requiredWords"
          :word="word"
          :modelValue="inputWords[i]"
          @update:modelValue="handleChange(i, $event)"
        ></mnemonic-input>
      </div>
    </div>

    <button
      data-ci="create-wallet-enter-mnemonic-component--confirm-button"
      @click="$emit('confirm')"
      type="button"
      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      :class="{ 'bg-indigo-200 cursor-not-allowed': !inputsMatch, 'bg-indigo-600 hover:bg-indigo-700': inputsMatch }"
      :disabled="!inputsMatch"
    >
      I have written down my recovery phrase
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MnemonicInput from '@/components/MnemonicInput.vue'

const CreateWalletViewMnemonic = defineComponent({
  props: {
    mnemonic: {
      type: Array as PropType<Array<string>>,
      required: true
    }
  },

  components: {
    MnemonicInput
  },

  data () {
    if (this.mnemonic && this.mnemonic.length >= 4) {
      const requiredWords = [...this.mnemonic].sort(() => 0.5 - Math.random()).slice(0, 5)
      return {
        requiredWords,
        inputWords: [...this.mnemonic].map((word: string) => requiredWords.indexOf(word) > 0 ? '' : word) as string[]
      }
    }
    return {
      requiredWords: [],
      inputWords: this.mnemonic as string[]
    }
  },

  computed: {
    inputsMatch (): boolean {
      return this.inputWords.toString() === this.mnemonic.toString()
    }
  },

  methods: {
    handleChange (index: number, value: string) {
      const newWords: string[] = [...this.inputWords as string[]]
      newWords[index] = value
      this.inputWords = newWords
    }
  },

  emits: ['confirm', 'back']
})

export default CreateWalletViewMnemonic
</script>
