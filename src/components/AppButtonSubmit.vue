<template>
  <button class="border border-solid border-rGreen bg-rGreen rounded py-2.5 font-sm text-rOffwhite cursor-pointer hover:bg-rGreenDark hover:border-rGreenDark transition-colors focus:outline-none">
    <slot></slot>
  </button>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>
