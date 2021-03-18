<template lag="ts">
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
v-bind:css="false"
    enter-active-class="transition ease-out duration-300"
    enter-class="opacity-0 transform scale-90"
    enter-to-class="opacity-100 transform scale-100"
    leave-active-class="transition ease-in duration-300"
    leave-class="opacity-100 transform scale-100"
    leave-to-class="opacity-0 transform scale-90"
  >
    <slot/>
  </transition>
</template>

<script>
import { defineComponent } from 'vue'

// https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/
const TransitionExpand = defineComponent({
  methods: {
    afterEnter (el) {
      el.style.height = 'auto'
    },
    enter (el) {
      const { width } = getComputedStyle(el)
      /* eslint-disable no-param-reassign */
      el.style.width = width
      el.style.position = 'absolute'
      el.style.visibility = 'hidden'
      el.style.height = 'auto'
      /* eslint-enable */
      const { height } = getComputedStyle(el)
      /* eslint-disable no-param-reassign */
      el.style.width = null
      el.style.position = null
      el.style.visibility = null
      el.style.height = 0
      /* eslint-enable */
      // Force repaint to make sure the
      // animation is triggered correctly.
      // eslint-disable-next-line no-unused-expressions
      getComputedStyle(el).height
      requestAnimationFrame(() => {
        // eslint-disable-next-line no-param-reassign
        el.style.height = height
      })
    },
    leave (el) {
      const { height } = getComputedStyle(el)
      // eslint-disable-next-line no-param-reassign
      el.style.height = height
      // Force repaint to make sure the
      // animation is triggered correctly.
      // eslint-disable-next-line no-unused-expressions
      getComputedStyle(el).height
      requestAnimationFrame(() => {
        // eslint-disable-next-line no-param-reassign
        el.style.height = 0
      })
    }
  }
})

export default TransitionExpand
</script>

<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: height 1s ease-in-out;
  overflow: hidden;
}
.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
