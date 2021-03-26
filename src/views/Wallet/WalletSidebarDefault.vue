<template>
  <div class="w-72 mx-5 py-8">
    <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">

    <div class="flex flex-col text-white hover:text-rGreen transition-colors cursor-pointer" @click="$emit('open')">
      <div class="relative py-3">
        <div class="flex flex-row relative z-20 mb-4 justify-between items-center">
          <img alt="Account" src="../../assets/account.svg" class="mr-4">
          <div class="font-medium leading-snug flex-1">My first account!</div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="9" width="2" height="2" rx="1" class="fill-current"/>
            <rect x="9" y="9" width="2" height="2" rx="1" class="fill-current"/>
            <rect x="13" y="9" width="2" height="2" rx="1" class="fill-current"/>
          </svg>
        </div>
        <div class="text-xs text-rGrayMed relative z-20 flex justify-between">
          <span class="mr-2">addr:</span>
          <span class="flex-1">xxxxxxxxxxxxxxxxxxxxxxxx</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="hover:text-rGray cursor-pointer">
            <path d="M10.0452 9.53031C9.33401 8.8191 9.33401 7.66599 10.0452 6.95478L11.7122 5.28776C12.4234 4.57655 13.5766 4.57655 14.2878 5.28776C14.999 5.99897 14.999 7.15208 14.2878 7.86329L12.6208 9.53027C11.9096 10.2416 10.7565 10.2416 10.0452 9.53031Z" class="stroke-current" stroke-miterlimit="10"/>
            <path d="M5.80254 13.7735C5.09133 13.0623 5.09133 11.9092 5.80254 11.1979L7.46956 9.53093C8.18077 8.81972 9.33388 8.81972 10.0451 9.53093C10.7563 10.2421 10.7563 11.3952 10.0451 12.1065L8.37812 13.7734C7.66695 14.4847 6.5138 14.4847 5.80254 13.7735Z" class="stroke-current" stroke-miterlimit="10"/>
          </svg>
        </div>
        <div class="absolute bg-gradient-to-r from-blueEnd to-rBlue inset-0 w-full h-full z-10 -mx-8 opacity-40">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const WalletSidebarDefault = defineComponent({
  emits: ['open']
})

export default WalletSidebarDefault
</script>
