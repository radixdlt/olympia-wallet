<template>
  <div class="absolute invisible group-hover:visible -mt-full bg-rGrayLightest text-rBlack bottom-full text-xs p-1 rounded-sm shadow border border-solid border-rGrayLight w-60">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const Tooltip = defineComponent({})

export default Tooltip
</script>
