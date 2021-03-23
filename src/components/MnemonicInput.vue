<template>
  <input
    type="text"
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
    placeholder="word"
    :disabled="!requireInput"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  >
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
