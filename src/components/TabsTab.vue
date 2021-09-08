<template>
  <div
    class="w-52 flex items-center justify-center py-5 -mb-px relative z-20 cursor-pointer"
    :class="{'bg-white border-t border-r border-l border-rGray rounded-t-md': isActive}"
    @click="$emit('click')"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const TabsTab = defineComponent({
  props: {
    isActive: {
      type: Boolean,
      required: true
    }
  }
})

export default TabsTab
</script>
