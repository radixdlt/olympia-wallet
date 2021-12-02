<template>
  <form data-ci="create-wallet-enter-mnemonic-component" @submit.prevent="$emit('confirm', inputWords)">
    <div
      class="grid"
      :class="{
        'grid-cols-4 gap-y-14 mb-12': mnemonicStrength === StrengthT.WORD_COUNT_12,
        'grid-cols-6 gap-y-14 mb-12': mnemonicStrength === StrengthT.WORD_COUNT_18,
        'grid-cols-6 gap-y-10 mb-12': mnemonicStrength === StrengthT.WORD_COUNT_24
      }"
    >
      <div v-for="(word, i) in inputWords" :key="i">
        <mnemonic-input
          :require-input="true"
          :modelValue="word"
          :index="i"
          :isSmall="mnemonicStrength != StrengthT.WORD_COUNT_12"
          @update:modelValue="handleChange(i, $event)"
        ></mnemonic-input>
      </div>
    </div>

    <AppSelect
      :options="mnemonicStrengthOptions"
      :selected="selectedStrengthOption"
      @select="handleSelect"
      class="mb-16"
    />

    <ButtonSubmit data-ci="create-wallet-enter-mnemonic-component--confirm-button" class="w-96" :disabled="!inputValid">
      {{buttonText}}
    </ButtonSubmit>
  </form>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, ref, Ref } from 'vue'
import MnemonicInput from '@/components/MnemonicInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import AppSelect, { AppSelectOptionT } from '@/components/AppSelect.vue'
import { StrengthT } from '@radixdlt/application'
import { useI18n } from 'vue-i18n'
import { mnemonicStrengthOptions } from '@/helpers/mnemonic'

const RestoreWalletEnterMnemonic = defineComponent({
  components: {
    AppSelect,
    ButtonSubmit,
    MnemonicInput
  },

  setup () {
    const { t } = useI18n({ useScope: 'global' })
    const mnemonicStrength: Ref<StrengthT> = ref(StrengthT.WORD_COUNT_12)

    const selectedStrengthOption: ComputedRef<AppSelectOptionT | undefined> = computed(() => {
      return mnemonicStrengthOptions.find((opt: AppSelectOptionT) => opt.id === mnemonicStrength.value)
    })
    const inputWords: Ref<string[]> = ref([])
    const inputValid: ComputedRef<boolean> = computed(() =>
      inputWords.value.every((value: string) => value && value.length > 0)
    )
    const buttonText: ComputedRef<string> = computed(() =>
      inputValid.value ? t('restoreWallet.recoveryButtonEnabled') : t('restoreWallet.recoveryButtonDisabled')
    )
    const handleSelect = (id: StrengthT) => {
      mnemonicStrength.value = id
      initInputWords()
    }
    const handleChange = (index: number, value: string) => {
      const newWords: string[] = [...inputWords.value as string[]]
      newWords[index] = value
      inputWords.value = newWords
    }
    const initInputWords = () => {
      let arrLength = 0
      switch (mnemonicStrength.value) {
        case StrengthT.WORD_COUNT_18:
          arrLength = 18
          break
        case StrengthT.WORD_COUNT_24:
          arrLength = 24
          break
        default:
          arrLength = 12
          break
      }
      inputWords.value = new Array(arrLength).fill('') as string[]
    }

    onMounted(() => { initInputWords() })

    return {
      buttonText,
      inputWords,
      inputValid,
      mnemonicStrength,
      selectedStrengthOption,
      mnemonicStrengthOptions,
      StrengthT,

      // methods
      handleChange,
      handleSelect
    }
  },

  emits: ['confirm']
})

export default RestoreWalletEnterMnemonic
</script>
