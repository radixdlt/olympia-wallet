<template>
  <form data-ci="create-wallet-enter-mnemonic-component" @submit.prevent="$emit('confirm', inputWords)">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in inputWords" :key="i" class="w-1/4 mb-14">
        <mnemonic-input
          :require-input="true"
          :modelValue="word"
          @update:modelValue="handleChange(i, $event)"
        ></mnemonic-input>
      </div>
    </div>

    <ButtonSubmit data-ci="create-wallet-enter-mnemonic-component--confirm-button" class="w-96" :disabled="!inputValid">
      {{buttonText}}
    </ButtonSubmit>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MnemonicInput from '@/components/MnemonicInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

const RestoreWalletEnterMnemonic = defineComponent({
  components: {
    ButtonSubmit,
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
      return this.inputValid ? this.$t('restoreWallet.recoveryButtonEnabled') : this.$t('restoreWallet.recoveryButtonDisabled')
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
