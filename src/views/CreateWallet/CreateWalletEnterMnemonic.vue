<template>
  <form data-ci="create-wallet-enter-mnemonic-component" @submit.prevent="$emit('confirm')">
    <div
      class="grid mb-12"
      :class="{
        'grid-cols-4 gap-y-14': mnemonicStrength === StrengthT.WORD_COUNT_12,
        'grid-cols-6 gap-y-14': mnemonicStrength === StrengthT.WORD_COUNT_18,
        'grid-cols-6 gap-y-6': mnemonicStrength === StrengthT.WORD_COUNT_24
      }"
    >
      <div v-for="(word, i) in mnemonic" :key="i">
        <mnemonic-input
          :require-input="requiredWords.indexOf(word) > 0"
          :modelValue="inputWords[i]"
          :index="i"
          :isSmall="mnemonicStrength != StrengthT.WORD_COUNT_12"
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
import { StrengthT } from '@radixdlt/application'

const CreateWalletViewMnemonic = defineComponent({
  components: {
    ButtonSubmit,
    MnemonicInput
  },

  props: {
    mnemonic: {
      type: Array as PropType<Array<string>>,
      required: true
    },
    mnemonicStrength: {
      type: Number as PropType<StrengthT>,
      required: true
    }
  },

  setup () {
    return { StrengthT }
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
      inputWords: this.mnemonic as string[],
      requiredWords: []
    }
  },

  computed: {
    inputsMatch (): boolean {
      return this.inputWords.toString() === this.mnemonic.toString()
    },
    buttonText (): string {
      return this.inputsMatch ? this.$t('createWallet.recoveryButtonTwoEnabled') : this.$t('createWallet.recoveryButtonTwoDisabled')
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
