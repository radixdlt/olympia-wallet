<template>
  <a :href="rriUrl" target="_blank">
    <div class="font-light text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end uppercase">
      <slot></slot>
    </div>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    rriUrl: {
      type: String,
      required: true
    }
  }
})
</script>
