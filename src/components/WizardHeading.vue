<template>
  <div class="flex items-center mb-8 cursor-pointer" :class="{'cursor-not-allowed': disabled}" @click="!disabled && this.$emit('click')">
    <div
      class="rounded-full border w-5 h-5 border-white mr-2 transition-colors inline-flex justify-center items-center"
      :class="{
        'bg-white': isActiveStep || isCompleted,
        'opacity-40': isCompleted
      }"
    >
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isCompleted">
      <path d="M3.5723 8.8755L0 5.303L1.0605 4.2424L3.4883 6.6699L9.2095 0L10.3481 0.9766L3.5723 8.8755Z" class="fill-current text-rBlue" />
    </svg>
    </div>
    <div class="text-white" :class="{'opacity-40': !isActiveStep}">{{ name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const WizardHeading = defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    isActiveStep: Boolean,
    isCompleted: Boolean,
    disabled: Boolean
  },

  emits: ['click']
})

export default WizardHeading
</script>
