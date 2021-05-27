<template>
    <button @click="$emit('connectHardwareWallet', true)">
        Connect hw wallet
    </button>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  emits: ['connectHardwareWallet']
})
</script>
