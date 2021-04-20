<template>
  <div
    class="bg-white border border-rGray flex flex-col w-full"
    :class="{'rounded-b-md rounded-r-md': leftTabIsActive, 'rounded-md': !leftTabIsActive}"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const TabsContent = defineComponent({
  props: {
    leftTabIsActive: {
      type: Boolean,
      required: true
    }
  }
})

export default TabsContent
</script>
