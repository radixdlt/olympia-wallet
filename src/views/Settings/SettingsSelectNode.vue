<template>
  <div class="pt-6 px-6 pb-4">
    <div class="text-rGrayDark text-sm mb-7 w-full max-w-lg">
      {{ $t('settings.nodeDisclaimer') }}
    </div>
    <div class="flex flex-row flex-wrap relative">
      <NodeListItem
        v-for="(node, i) in defaultNetworks"
        :key="i"
        :node="node"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { defaultNetworks } from '@/helpers/network'
import NodeListItem from '@/components/NodeListItem.vue'

export default defineComponent({
  components: {
    NodeListItem
  },

  setup () {
    return {
      defaultNetworks
    }
  }
})
</script>
