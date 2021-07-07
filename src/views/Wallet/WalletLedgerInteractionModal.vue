<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black">
    <div class="h-modal bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      Speaking to Ledger, as you do.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const WalletLedgerInteractionModal = defineComponent({

  props: {
  },

  computed: {
  },
  methods: {

  },

  emits: []
})

export default WalletLedgerInteractionModal
</script>
