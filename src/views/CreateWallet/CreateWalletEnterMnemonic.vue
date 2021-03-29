<template>
  <div data-ci="create-wallet-enter-mnemonic-component">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in mnemonic" :key="i" class="w-1/4 mb-14">
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
      class="inline-flex items-center justify-center px-6 py-5 border font-normal leading-snug rounded w-96"
      :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': !inputsMatch, 'bg-rGreen border-rGreen text-white': inputsMatch }"
      :disabled="!inputsMatch"
    >
      {{buttonText}}
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
    },
    buttonText (): string {
      return this.inputsMatch ? 'I\'ve done it!' : 'Fill these out first'
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

export default CreateWalletViewMnemonic
</script>
