<template>
  <span :class="{'text-3xl': showDot}">{{ display }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    values: {
      type: String,
      required: false
    },
    index: {
      type: Number,
      required: true
    },
    focused: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    showNumber (): boolean {
      // console.log('values-->', this.values, ' index-->', this.index, 'focused--> ', this.focused)
      return !!(this.values && this.values.length === this.index + 1 && this.focused)
    },
    showDot (): boolean {
      return !!(!this.showNumber && this.values && this.values.length > this.index)
    },
    display (): string {
      if (this.values && this.showNumber) return this.values[this.index]
      else if (this.values && this.showDot) return '•'
      else return ''
    }
  }
})
</script>
