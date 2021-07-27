<template>
  <button
    type="submit"
    class="inline-flex items-center justify-center border font-normal leading-snug rounded transition-colors"
    :class="{
      'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disabled,
      'bg-rRed border-4 border-rRed text-white hover:bg-opacity-80 active:bg-rGray': !disabled && destructive,
      'bg-rGreen border-4 border-rGreen text-white hover:bg-rGreenDark active:bg-rGray': !disabled && !destructive,
      'px-6 py-4 w-72': !small,
      'px-2 py-2': small
    }"
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
    },
    small: {
      type: Boolean,
      required: false,
      default: false
    },
    destructive: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})

export default ButtonSubmit
</script>
