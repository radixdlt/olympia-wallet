<template>
  <div class="flex w-full">
    <div class="flex flex-col justify-center items-center bg-white pt-8 pb-4 px-11 rounded mx-auto">
      Todo: Add TOS
      <button
        @click.prevent="acceptTos"
        role="button"
        type="button"
        class="inline-flex items-center justify-center border font-normal leading-snug rounded transition-colors px-6 py-4 w-72 w-96 bg-rGreen border-4 border-rGreen text-white hover:bg-rGreenDark cursor-pointer focus:ring-0"
      >{{ $t('home.acceptTos')}}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const HomeTos = defineComponent({
  emits: ['acceptTos'],

  methods: {
    acceptTos () {
      this.$emit('acceptTos')
    }
  }
})

export default HomeTos
</script>
