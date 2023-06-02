<template>
  <div class="border border-solid border-rGray p-5 rounded-md flex flex-row items-center text-rGrayMed w-full mb-2 justify-between">
    <div class="flex flex-row items-center flex-grow overflow-ellipsis">
      <AppRadioIndicator
        :enabled="isActive"
        :disabled="loading || computedNetwork != 'mainnet'"
        @click="handleSelectNode"
        class="mr-2"
      />
      <span class="mr-4">{{ $t('settings.gatewayAddressLabel') }}:</span>
      <span>{{ url }}</span>
    </div>
    <div class="flex-grow-0 w-48">{{ $t('settings.nodeNetworkLabel')}}:
      <span v-if="computedNetwork" class="text-rGreen uppercase"> {{ computedNetwork }}</span>
      <span v-else class="border-t border-solid border-rGreen w-4 inline-block mb-1 ml-4"></span>
    </div>
    <div class="w-16">
      <IconRadixLogo
        v-if="showRadixLogo"
        class="text-rGrayDark"
      />
      <a @click="forgetUrl" class="w-12 justify-end flex" v-else>
        <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rGrayDark stroke-current hover:text-rRed">
          <path d="M2.48868 7.845L2.865 16.5H11.655L12.0341 7.845"/>
          <path d="M0 4.81818H4.47M4.47 4.81818V1.5H10.05V4.81818M4.47 4.81818H10.05M10.05 4.81818H14.52"/>
        </svg>
      </a>
    </div>
  </div>
  <div
    v-if="computedNetwork === 'MAINNET' && !connected && !loading"
    class="text-xs text-rRed mb-2"
  >
    {{ $t('settings.mainnetUnavailableOne') }}<a href="https://status.radixdlt.com" target="_blank" class="underline">{{ $t('settings.mainnetUnavailableLink') }}</a>{{ $t('settings.mainnetUnavailableTwo') }}
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onUnmounted } from 'vue'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import IconRadixLogo from '@/components/IconRadixLogo.vue'
import { useToast } from 'vue-toastification'
import { useConnectableRadix, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
// import { ref } from '@nopr3d/vue-next-rx'
// import { AccountT } from '@radixdlt/application'
import { forgetCustomNodeURL } from '@/actions/vue/data-store'

export default defineComponent({
  components: {
    AppRadioIndicator,
    IconRadixLogo
  },

  props: {
    url: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false
    },
    network: {
      type: String,
      required: false
    }
  },

  setup (props, { emit }) {
    const toast = useToast()
    const router = useRouter()
    const { connected: activeConnection, nodeUrl } = useWallet(router)
    const { connected, loading, networkId, testConnection, cleanupSubscriptions } = useConnectableRadix()
    // const updatedConnection: Ref<boolean> = ref(false)

    const isActive: ComputedRef<boolean> = computed(() => nodeUrl.value ? nodeUrl.value === props.url : false)

    const handleSelectNode = () => {
      if (computedNetwork.value !== 'mainnet') {
        toast.error('Only mainnet is currently supported')
        return
      }
      if (activeConnection.value && !connected.value) {
        toast.error('Invalid network, unable to connect')
        return
      }
      emit('select', props.url)
    }

    // // watch connection updated and addresses. if updated, switch to [0] account
    // watch([accounts, updatedConnection], ([a, uc], [oldA, oldUc]) => {
    //   if (uc && a && oldA && a.all.length > 0 && [...a.all] !== [...oldA.all]) {
    //     // Force a switch to the 0 index account when we update to a new node connection
    //     switchAccount(a.all[0] as AccountT)
    //     updatedConnection.value = false
    //   }
    // })

    const computedNetwork: ComputedRef<string> = computed(() => {
      if (props.network) return props.network
      else return networkId.value || ''
    })

    testConnection(props.url)

    onUnmounted(() => cleanupSubscriptions())

    return {
      showRadixLogo: props.isDefault,
      isActive,
      handleSelectNode,
      loading,
      connected,
      computedNetwork,
      forgetUrl: () => {
        if (isActive.value) {
          toast.error('Switch networks before removing this node')
          return
        }
        forgetCustomNodeURL(props.url)
        emit('refresh')
      }
    }
  },
  emits: ['refresh', 'select']
})
</script>
