<template>
  <button class="border border-solid border-rGreen rounded py-2.5 px-4 font-sm text-rGreen cursor-pointer inline-flex flex-row items-center hover:bg-rGreen hover:text-rOffwhite transition-colors focus:outline-none">
    <slot></slot>
  </button>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>
