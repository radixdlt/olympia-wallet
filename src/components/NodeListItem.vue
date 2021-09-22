<template>
  <div class="border border-solid border-rGray p-5 rounded-md flex flex-row items-center text-rGrayMed w-full mb-2 justify-between">
    <div class="flex flex-row items-center flex-grow overflow-ellipsis">
      <AppRadioIndicator
        :enabled="isActive"
        :disabled="loading"
        @click="handleSelectNode"
        class="mr-2"
      />
      <span class="mr-4">{{ $t('settings.nodeAddressLabel') }}:</span>
      <a :href="url" target="_blank" class="text-rBlue`">{{ url }}</a>
    </div>
    <div class="flex-grow-0 w-48">{{ $t('settings.nodeNetworkLabel')}}: <span class="text-rGreen uppercase">{{ networkId }}</span></div>
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
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onUnmounted, Ref, watch } from 'vue'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import IconRadixLogo from '@/components/IconRadixLogo.vue'
import { useToast } from 'vue-toastification'
import { useConnectableRadix, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { ref } from '@nopr3d/vue-next-rx'
import { AccountT } from '@radixdlt/application'
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
    }
  },

  setup (props, { emit }) {
    const toast = useToast()
    const router = useRouter()
    const { connected: activeConnection, activeNetwork, updateConnection, accounts, setSwitching, switchAccount } = useWallet(router)
    const { connected, loading, networkId, testConnection, cleanupSubscriptions } = useConnectableRadix()
    const updatedConnection: Ref<boolean> = ref(false)

    const isActive: ComputedRef<boolean> = computed(() => activeNetwork.value ? activeNetwork.value === networkId.value : false)

    const handleSelectNode = () => {
      if (activeConnection.value && !connected.value) {
        toast.error('Invalid network, unable to connect')
        return
      }
      updateConnection(props.url).then((network) => {
        updatedConnection.value = true
        toast.success(`Switched to new node: ${network}`)
      }).catch(() => {
        setSwitching(false)
        toast.error('Unable to connect to node')
      })
    }

    // watch connection updated and addresses. if updated, switch to [0] account
    watch([accounts, updatedConnection], ([a, uc], [oldA, oldUc]) => {
      if (uc && a && oldA && a.all.length > 0 && [...a.all] !== [...oldA.all]) {
        // Force a switch to the 0 index account when we update to a new node connection
        switchAccount(a.all[0] as AccountT)
        updatedConnection.value = false
      }
    })

    testConnection(props.url)

    onUnmounted(() => cleanupSubscriptions())

    return {
      showRadixLogo: props.isDefault,
      isActive,
      handleSelectNode,
      loading,
      connected,
      networkId,
      forgetUrl: () => {
        forgetCustomNodeURL(props.url)
        emit('refresh')
      }
    }
  },
  emits: ['refresh']
})
</script>
