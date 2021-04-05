<template>
  <div class="flex flex-row">
    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm mr-5">
      <h2 class="font-extralight text-5xl leading-snug text-rBlack mb-4">{{ $t('home.createTitle')}}</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">{{ $t('home.createContent')}}</p>
      <router-link
        to="/create-wallet"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-rGreen border border-rGreen text-white font-normal leading-snug rounded"
      >
        {{ $t('home.createButton')}}
      </router-link>
    </div>

    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm">
      <h2 class="font-extralight text-5xl leading-snug text-rBlack mb-4">{{ $t('home.restoreTitle')}}</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">{{ $t('home.restoreContent')}}</p>
      <router-link
        to="/create-wallet"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-none border border-rGreen text-rGreen font-normal leading-snug rounded"
      >
        {{ $t('home.restoreButton')}}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const HomeCreateAndRestore = defineComponent({
})

export default HomeCreateAndRestore
</script>
