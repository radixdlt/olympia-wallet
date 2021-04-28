<template>
  <button
    type="submit"
    class="inline-flex items-center justify-center px-6 py-4 border font-normal leading-snug rounded transition-colors w-72"
    :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disabled, 'bg-rGreen border-4 border-rGreen text-white hover:bg-rGreenDark active:bg-rGray': !disabled }"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const ButtonSubmit = defineComponent({
  props: {
    disabled: {
      type: Boolean,
      required: true
    }
  }
})

export default ButtonSubmit
</script>
