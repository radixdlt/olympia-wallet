<template>
  <div @click.stop="copyText" class="pointer-events-auto cursor-pointer">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="hover:text-rGray cursor-pointer">
      <path d="M10.0452 9.53031C9.33401 8.8191 9.33401 7.66599 10.0452 6.95478L11.7122 5.28776C12.4234 4.57655 13.5766 4.57655 14.2878 5.28776C14.999 5.99897 14.999 7.15208 14.2878 7.86329L12.6208 9.53027C11.9096 10.2416 10.7565 10.2416 10.0452 9.53031Z" class="stroke-current" stroke-miterlimit="10"/>
      <path d="M5.80254 13.7735C5.09133 13.0623 5.09133 11.9092 5.80254 11.1979L7.46956 9.53093C8.18077 8.81972 9.33388 8.81972 10.0451 9.53093C10.7563 10.2421 10.7563 11.3952 10.0451 12.1065L8.37812 13.7734C7.66695 14.4847 6.5138 14.4847 5.80254 13.7735Z" class="stroke-current" stroke-miterlimit="10"/>
    </svg>
  </div>
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
