<template>
  <form data-ci="create-wallet-enter-mnemonic-component" @submit.prevent="$emit('confirm')">
    <div class="flex flex-wrap mb-4">
      <div v-for="(word, i) in mnemonic" :key="i" class="w-1/4 mb-14">
        <mnemonic-input
          :require-input="requiredWords.indexOf(word) > 0"
          :modelValue="inputWords[i]"
          :index=i
          @update:modelValue="handleChange(i, $event)"
        ></mnemonic-input>
      </div>
    </div>

    <ButtonSubmit data-ci="create-wallet-enter-mnemonic-component--confirm-button" class="w-96" :disabled="!inputsMatch">
      {{buttonText}}
    </ButtonSubmit>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MnemonicInput from '@/components/MnemonicInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

const CreateWalletViewMnemonic = defineComponent({
  components: {
    ButtonSubmit,
    MnemonicInput
  },

  props: {
    mnemonic: {
      type: Array as PropType<Array<string>>,
      required: true
    }
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
      return true
    },
    buttonText (): string {
      return this.$t('createWallet.recoveryButtonTwoEnabled')
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
