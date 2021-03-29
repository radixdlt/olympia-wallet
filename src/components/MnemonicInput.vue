<template>
  <div
    class="w-40"
    :class="{
      'border rounded-full border-rGray leading-tight h-16 justify-center inline-flex': !requireInput,
      'h-full': requireInput
    }"
  >
    <input
      type="text"
      class="text-center h-full w-full"
      :class="{
        'filter-blur border-0': !requireInput,
        'focus:outline-none focus:ring-transparent focus:shadow-none border-t-0 border-l-0 border-r-0 border-b border-rBlack': requireInput
      }"
      placeholder="word"
      :disabled="!requireInput"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

const MnemonicInput = defineComponent({
  props: {
    requiredWords: {
      type: Array as PropType<Array<string>>,
      required: true
    },
    word: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      required: false
    }
  },

  data () {
    return {
      requireInput: this.requiredWords.indexOf(this.word) > 0
    }
  },

  emits: ['update:modelValue']
})

export default MnemonicInput
</script>
