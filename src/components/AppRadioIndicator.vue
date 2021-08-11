<template>
  <svg
    v-if="enabled"
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="text-rGreen"
  >
    <circle cx="13" cy="13" r="5" class="fill-current" />
    <rect x="5" y="5" width="16" height="16" rx="8" class="stroke-current" stroke-width="2"/>
  </svg>
  <svg
    v-else
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="text-rGray"
  >
     <rect x="4.5" y="4.5" width="17" height="17" rx="8.5" class="stroke-current" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  }
})
</script>
