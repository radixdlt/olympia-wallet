<template>
  <div class="font-light text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end uppercase">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const TokenSymbol = defineComponent({
})

export default TokenSymbol
</script>
