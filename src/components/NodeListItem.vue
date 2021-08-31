<template>
  <div class="border border-solid border-rGray p-5 rounded-md flex flex-row items-center text-rGrayMed w-full mb-2 justify-between">
    <div class="flex flex-row items-center">
      <AppRadioIndicator
        :enabled="isActive"
        :disabled="loading"
        @click="handleSelectNode"
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
import { computed, ComputedRef, defineComponent, onUnmounted, PropType } from 'vue'
import { ChosenNetworkT, isDefaultNetwork } from '@/helpers/network'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import IconRadixLogo from '@/components/IconRadixLogo.vue'
import { useToast } from 'vue-toastification'
import { useConnectableRadix, useRadix } from '@/composables'

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
    const toast = useToast()
    const { network, updateConnection } = useRadix()
    const { connected, loading, networkId, testConnection, cleanupSubscriptions } = useConnectableRadix()

    const isActive: ComputedRef<boolean> = computed(() => network.value === networkId.value)

    const handleSelectNode = () => {
      if (!connected.value) toast.error('Invalid network, unable to connect')
      else {
        updateConnection(props.node)
          .then(() => {
            toast.success(`Switched to new node: ${networkId.value}`)
          })
      }
    }

    testConnection(props.node.networkURL)

    onUnmounted(() => cleanupSubscriptions())

    return {
      showRadixLogo: isDefaultNetwork(props.node),
      isActive,
      handleSelectNode,
      loading,
      connected
    }
  }
})
</script>
