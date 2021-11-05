<template>
  <div
    class="border rounded-full border-rGray leading-tight h-16 justify-center inline-flex items-center"
    :class="{
      'w-40': isWide,
      'w-32': !isWide
    }"
  >
    <div :class="{ 'filter-blur': obfuscate }">
      {{index + 1}}. {{ word }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const MnemonicDisplay = defineComponent({
  props: {
    obfuscate: {
      type: Boolean,
      required: true
    },
    word: {
      type: String,
      required: false
    },
    index: {
      type: Number,
      required: true
    },
    isWide: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})

export default MnemonicDisplay
</script>
