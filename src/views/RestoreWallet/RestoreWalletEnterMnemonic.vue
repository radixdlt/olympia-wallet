<template>
  <div data-ci="create-wallet-enter-mnemonic-component">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in inputWords" :key="i" class="w-1/4 mb-14">
        <mnemonic-input
          :require-input="true"
          :modelValue="word"
          @update:modelValue="handleChange(i, $event)"
        ></mnemonic-input>
      </div>
    </div>

    <button
      data-ci="create-wallet-enter-mnemonic-component--confirm-button"
      @click="$emit('confirm', inputWords)"
      type="button"
      class="inline-flex items-center justify-center px-6 py-5 border font-normal leading-snug rounded w-96"
      :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': !inputValid, 'bg-rGreen border-rGreen text-white': inputValid }"
      :disabled="!inputValid"
    >
      {{buttonText}}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MnemonicInput from '@/components/MnemonicInput.vue'

const RestoreWalletEnterMnemonic = defineComponent({
  components: {
    MnemonicInput
  },

  data () {
    return {
      inputWords: new Array(12).fill('') as string[]
    }
  },

  computed: {
    inputValid (): boolean {
      return this.inputWords.every((value: string) => value && value.length > 0)
    },
    buttonText (): string {
      return this.inputValid ? 'I\'ve done it!' : 'Fill these out first'
    }
  },

  methods: {
    handleChange (index: number, value: string) {
      const newWords: string[] = [...this.inputWords as string[]]
      newWords[index] = value
      this.inputWords = newWords
    }
  },

  emits: ['confirm']
})

export default RestoreWalletEnterMnemonic
</script>
