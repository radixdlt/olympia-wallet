<template>
  <div data-ci="create-wallet-view-mnemonic-component">
    <div
      class="grid"
      :class="{
        'grid-cols-4 gap-y-14 mb-12': mnemonicStrength === StrengthT.WORD_COUNT_12,
        'grid-cols-6 gap-y-14 mb-12': mnemonicStrength === StrengthT.WORD_COUNT_18,
        'grid-cols-6 gap-y-6 mb-6': mnemonicStrength === StrengthT.WORD_COUNT_24
      }"
    >
      <div v-for="(word, i) in mnemonic" :key="i">
        <span
          class="border rounded-full border-rGray leading-tight h-16 justify-center items-center inline-flex"
          :class="{
            'w-40': mnemonicStrength === StrengthT.WORD_COUNT_12,
            'w-26': mnemonicStrength != StrengthT.WORD_COUNT_12
          }"
        >
          {{ word }}
        </span>
      </div>
    </div>

    <div class="mb-12 h-10">
      <button
        v-if="!shouldShowStrengthOptions"
        @click="handleShowStrengthOptions"
        class="text-rGrayDark hover:text-rBlue transition-colors underline text-sm"
      >
        {{ $t('createWallet.changeSeedPhraseLength') }}
      </button>

      <AppSelect
        v-if="shouldShowStrengthOptions"
        :options="mnemonicStrengthOptions"
        :selected="selectedStrengthOption"
        @select="handleSelect"
      />
    </div>

    <ButtonSubmit @click="$emit('confirm')" :disabled="false" class="w-96">
      {{ $t('createWallet.recoveryButtonOne') }}
    </ButtonSubmit>
  </div>
</template>

<script lang="ts">
import { ComputedRef, defineComponent, PropType, Ref, ref, computed } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import AppSelect, { AppSelectOptionT } from '@/components/AppSelect.vue'
import { StrengthT } from '@radixdlt/application'
import { mnemonicStrengthOptions } from '@/helpers/mnemonic'

const CreateWalletViewMnemonic = defineComponent({
  components: {
    AppSelect,
    ButtonSubmit
  },

  setup (props, { emit }) {
    const shouldShowStrengthOptions: Ref<boolean> = ref(false)
    const handleShowStrengthOptions = () => { shouldShowStrengthOptions.value = !shouldShowStrengthOptions.value }

    const selectedStrengthOption: ComputedRef<AppSelectOptionT | undefined> = computed(() => {
      return mnemonicStrengthOptions.find((opt: AppSelectOptionT) => opt.id === props.mnemonicStrength)
    })
    const handleSelect = (id: number) => {
      shouldShowStrengthOptions.value = false
      emit('setSeedStrength', id)
    }

    return {
      selectedStrengthOption,
      shouldShowStrengthOptions,
      mnemonicStrengthOptions,
      StrengthT,

      // methods
      handleSelect,
      handleShowStrengthOptions
    }
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

  emits: ['confirm', 'setSeedStrength']
})

export default CreateWalletViewMnemonic
</script>
