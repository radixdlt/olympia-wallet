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
        :radixConnectService="radixConnectService"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { defaultNetworks } from '@/helpers/network'
import NodeListItem from '@/components/NodeListItem.vue'
import RadixConnectService from '@/services/RadixConnectService'

export default defineComponent({
  components: {
    NodeListItem
  },

  setup () {
    return {
      defaultNetworks
    }
  },

  props: {
    radixConnectService: {
      type: Object as PropType<RadixConnectService>,
      required: true
    }
  }
})
</script>
