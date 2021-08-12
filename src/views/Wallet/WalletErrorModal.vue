<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modalSmall bg-white rounded-md py-2 px-7 w-full max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div class="text-center">
        <div class="text-center mt-8 text-rRed text-lg">
          {{ title }}
        </div>
        <div class="text-center mt-4 text-rBlack text-sm px-6">
          <p> {{ copyOne }} </p>
          <p v-if="copyTwo" class="mt-4"> {{ copyTwo }} </p>
        </div>

        <button @click="$emit('closeErrorModal')" class="block m-auto pt-4"> Close this </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

const WalletErrorModal = defineComponent({

  props: {
    title: {
      type: String,
      required: true
    },
    copyOne: {
      type: String,
      required: true
    },
    copyTwo: {
      type: String,
      required: false
    }
  },

  emits: ['closeErrorModal']
})

export default WalletErrorModal
</script>
