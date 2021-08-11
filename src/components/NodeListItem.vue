<template>
  <div class="border border-solid border-rGray p-5 rounded-md flex flex-row items-center text-rGrayMed w-full mb-2 justify-between">
    <div class="flex flex-row items-center">
      <AppRadioIndicator
        :enabled="isActive"
        class="mr-2"
      />
      <span class="mr-4">{{ $t('settings.nodeAddressLabel') }}:</span>
      <a :href="node.networkURL" target="_blank" class="text-rBlue`">{{ node.networkURL }}</a>
    </div>
    <div>{{ $t('settings.nodeNetworkLabel')}}: <span class="text-rGreen uppercase">{{ node.network }}</span></div>
    <IconRadixLogo
      v-if="showRadixLogo"
      class="text-rGrayDark"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChosenNetworkT, isDefaultNetwork, isCurrentNetwork } from '@/helpers/network'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import IconRadixLogo from '@/components/IconRadixLogo.vue'

export default defineComponent({
  components: {
    AppRadioIndicator,
    IconRadixLogo
  },

  props: {
    node: {
      type: Object as PropType<ChosenNetworkT>,
      required: true
    }
  },

  setup (props) {
    return {
      showRadixLogo: isDefaultNetwork(props.node),
      isActive: isCurrentNetwork(props.node)
    }
  }
})
</script>
