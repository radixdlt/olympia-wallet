<template>
  <transition
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-active-class="ease-out duration-300"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="ease-in duration-200"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="visible"
      class="rounded overflow-hidden max-w-lg w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div class="bg-rGrayLight text-center pt-8 pb-7">
        <div
          v-if="slots.icon != undefined"
          class="mb-4 flex flex-row justify-center"
        >
          <slot name="icon"></slot>
        </div>
        <div class="text-rBlue text-2xl font-light">{{ title }}</div>
      </div>
      <div
        v-if="slots.content != undefined"
        class="bg-white pt-6 pb-5 text-rGrayDark text-base text-center space-y-5"
      >
        <slot name="content"></slot>
      </div>
      <div
        v-if="slots.info != undefined"
        class="bg-rGrayLight pt-6 pb-16 text-rGrayDark text-base text-center"
      >
        <slot name="info"></slot>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, useSlots } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false
    },
    visible: {
      type: Boolean,
      required: true
    }
  },

  setup () {
    const slots = useSlots()

    return {
      slots
    }
  }
})
</script>
