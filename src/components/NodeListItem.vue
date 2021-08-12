<template>
  <div class="border border-solid border-rGray p-5 rounded-md flex flex-row items-center text-rGrayMed w-full mb-2 justify-between">
    <div class="flex flex-row items-center">
      <AppRadioIndicator
        :enabled="isActive"
        @click="handleSelectNode"
        class="mr-2 cursor-pointer"
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
import { defineComponent, onUnmounted, PropType, Ref } from 'vue'
import { ChosenNetworkT, isDefaultNetwork } from '@/helpers/network'
import RadixConnectService from '@/services/RadixConnectService'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import IconRadixLogo from '@/components/IconRadixLogo.vue'
import { Network, Radix } from '@radixdlt/application'
import { Subscription } from 'rxjs'
import { useToast } from 'vue-toastification'
import { ref } from '@nopr3d/vue-next-rx'

export default defineComponent({
  components: {
    AppRadioIndicator,
    IconRadixLogo
  },

  props: {
    node: {
      type: Object as PropType<ChosenNetworkT>,
      required: true
    },
    radixConnectService: {
      type: Object as PropType<RadixConnectService>,
      required: true
    }
  },

  setup (props) {
    const subs = new Subscription()
    const toast = useToast()
    const isActive: Ref<boolean> = ref(props.radixConnectService.isCurrentNetworkById(props.node.network))

    // Update selected icon when network changes
    props.radixConnectService.addEventListener('connect', () => {
      isActive.value = props.radixConnectService.isCurrentNetworkById(props.node.network)
    })

    const handleSelectNode = () => {
      // First, try to get a vaild networkId from the selected network URL
      const tempRadix = Radix.create()

      subs.add(tempRadix.ledger.networkId().subscribe({
        next: (networkId: Network) => {
          // Connect true radix instance to new node if successful
          props.radixConnectService.connectToNode(props.node.networkURL, networkId)
          toast.success(`Switched to new node: ${networkId}`)
        },
        error: () => {
          // Present user with an error if not
          toast.error('Invalid network, unable to connect')
        }
      }))
      tempRadix.connect(props.node.networkURL)
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      showRadixLogo: isDefaultNetwork(props.node),
      isActive,
      handleSelectNode
    }
  }
})
</script>
