<template>
  <a
    :href="href"
    class="flex flex-row items-center my-5 cursor-pointer transition-opacity"
    :class="{ 'opacity-70': !isActive }"
    @click="navigate"
  >
    <slot />
    <div class="font-normal text-white">{{ title }}</div>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const WalletNavLink = defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    href: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true
    },
    navigate: {
      type: Function,
      required: true
    },
    small: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})

export default WalletNavLink
</script>
