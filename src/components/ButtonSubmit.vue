<template>
  <button
    type="submit"
    class="inline-flex items-center justify-center px-6 py-4 border font-normal leading-snug rounded transition-colors w-72 mx-auto"
    :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disableSubmit, 'bg-rGreen border-rGreen text-white': !disableSubmit }"
    :disabled="disableSubmit"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const ButtonSubmit = defineComponent({
  props: {
    disableSubmit: {
      type: Boolean,
      required: true
    }
  }
})

export default ButtonSubmit
</script>
