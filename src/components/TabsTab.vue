<template>
  <div
    class="w-52 flex items-center justify-center py-5 -mb-px relative z-20 cursor-pointer"
    :class="{
      'bg-white border-t border-r border-l border-rGray rounded-t-md': isActive,
      'opacity-50 cursor-not-allowed': isDisabled
    }"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef } from 'vue'

const TabsTab = defineComponent({
  props: {
    isActive: {
      type: Boolean,
      required: true
    },
    isDisabled: {
      type: Boolean,
      required: false,
      defaultValue: false
    }
  },

  setup (props, { emit }) {
    const isDisabled = toRef(props, 'isDisabled')

    return {
      handleClick () {
        if (!isDisabled.value) {
          emit('click')
        }
      }
    }
  },
  emits: ['click']
})

export default TabsTab
</script>
