<template>
  <button @click.stop="copyText" class="cursor-pointer flex items-center active:text-rBlack outline-none focus:outline-none">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7.5" y="7.5" width="7" height="7" class="stroke-current"/>
      <path d="M13 5H5V13" class="stroke-current"/>
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { copyToClipboard } from '@/actions/vue/create-wallet'

const ClickToCopy = defineComponent({
  props: {
    text: {
      type: String,
      required: true
    }
  },

  methods: {
    copyText () {
      copyToClipboard(this.text)
    }
  }
})

export default ClickToCopy
</script>
