<template>
  <div class="pt-6 px-6 pb-4">
    <div class="text-rGrayDark text-sm mb-7 w-full max-w-xl">
      <p>{{ $t('settings.nodeDisclaimer') }}</p>
      <p class="mt-2">{{ $t('settings.nodeDisclaimerWarning') }}</p>
    </div>
    <div class="relative">
      <div class="absolute z-20 w-full h-full bg-white" v-if="switching">
        <div class="flex flex-row items-center justify-center gap-4 mb-8">
          <div>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="container animate-spin">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M77.8789 52.8857C72.5168 68.6526 57.5862 80.0002 40.0001 80.0002C29.2115 80.0002 19.417 75.7265 12.2241 68.7838L14.9924 65.9158C21.4721 72.1701 30.2851 76.0141 40.0001 76.0141C55.8278 76.0141 69.2758 65.8025 74.1051 51.6023L77.8789 52.8857Z" fill="#052CC0"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 40C0 22.4565 11.2928 7.55578 26.9998 2.16064L28.2947 5.9305C14.1483 10.7896 3.98605 24.2106 3.98605 40C3.98605 46.5378 5.72622 52.663 8.76754 57.9442L5.31331 59.9334C1.93284 54.0632 0 47.2544 0 40Z" fill="#052CC0"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M38.0078 0H40.0008C62.0924 0 80.0008 17.9088 80.0008 40V41.993H38.0078V0ZM41.9939 4.04026V38.007H75.9606C74.9622 19.7039 60.2972 5.03859 41.9939 4.04026Z" fill="#00C389"/>
            </svg>
          </div>
          <h1 class="text-2xl">{{ $t('settings.switchingNetworks') }}</h1>
        </div>
        <p class="text-center text-rGrayDark text-sm">{{ $t('settings.takesTooLong') }}<button @click="refreshApp" class="text-rBlue underline">{{ $t('settings.clickToRefresh') }}</button></p>
      </div>

      <div class="flex flex-row flex-wrap relative" >
        <NodeListItem
          v-for="(network) in defaultNetworks"
          :network="network.network"
          :key="network.networkURL"
          :url="network.networkURL"
          :isDefault="true"
          @select="setConfirm"
        />

        <NodeListItem
          v-for="(url) in customNodeURLs"
          :key="url"
          :url="url"
          @refresh="loadURLs()"
          @select="setConfirm"
        />

        <form class="border border-solid border-rGray px-5 py-7 rounded-md flex flex-row items-start text-rGrayMed w-full mb-2 justify-between" @submit.prevent="handleAddNode">
          <div class="mr-4 my-2">{{ $t('settings.addCustomNodeLabel' )}}</div>
          <div class="flex-1 mr-4">
            <FormField
              type="text"
              name="nodeURL"
              class="w-full border border-solid px-4 rounded-md"
              placeholder="https://stokenet.radixdlt.com"
              rules="required"
              :underlineStyle="false"
              :validateOnInput="true"
              :class="{
                'border-rRed': showRedHighlight,
                'border-rGrayDark': !showRedHighlight
              }"
            />
            <FormErrorMessage name="nodeURL" class="text-sm" />
          </div>
          <button
            type="submit"
            :disabled="submitDisabled"
            class="border border-solid border-rGrayDark rounded-md inline-flex items-center py-1 px-2 my-1"
            :class="{'cursor-not-allowed': submitDisabled}"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
              <path d="M6 1V11" class="stroke-current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 6H11" class="stroke-current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('settings.addNodeButton') }}
          </button>
        </form>
      </div>
    </div>
    <confirm-network-change-modal v-if="nodeToConfirm" :url="nodeToConfirm" @cancel="cancelChange" @confirm="confirmChange" />
  </div>
</template>

<script lang="ts">
import { ref, Ref, computed, ComputedRef, defineComponent } from 'vue'
import { ChosenNetworkT, defaultNetworks } from '@/helpers/network'
import NodeListItem from '@/components/NodeListItem.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ConfirmNetworkChangeModal from './ConfirmNetworkChangeModal.vue'
import { useForm } from 'vee-validate'
import { Radix } from '@radixdlt/application'
import { firstValueFrom } from 'rxjs'
import { useToast } from 'vue-toastification'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import {
  persistCustomNodeURL,
  fetchCustomNodeURLs
} from '@/actions/vue/data-store'
import { refreshApp } from '@/actions/vue/general'

interface AddNodeForm {
  nodeURL: string;
}

export default defineComponent({
  components: {
    ConfirmNetworkChangeModal,
    FormField,
    FormErrorMessage,
    NodeListItem
  },

  setup () {
    const { values, meta, setErrors } = useForm<AddNodeForm>()
    const nodeToConfirm: Ref<string | null> = ref(null)
    const toast = useToast()
    const router = useRouter()
    const { updateConnection, switching } = useWallet(router)
    const customNodeURLs: Ref<string[]> = ref([])

    const loadURLs = () => {
      fetchCustomNodeURLs().then((urls) => { customNodeURLs.value = urls })
    }

    const isUnique = (val: string): boolean => {
      const defaultOptions = defaultNetworks.map((net) => net.networkURL.toLowerCase())
      const customOptions = customNodeURLs.value.map((url) => url.toLowerCase())
      return defaultOptions.concat(customOptions).findIndex((url) => url === val) === -1
    }

    const handleAddNode = async () => {
      const url = values.nodeURL.toLowerCase().trim()
      if (!isUnique(url)) {
        setErrors({
          nodeURL: 'Node URLs must be unique'
        })
        toast.error('Node URLs must be unique')
        return
      }
      const tempRadix = Radix.create()
      try {
        tempRadix.connect(url)
          .catch(() => {
            // Report errors for non url strings
            setErrors({
              nodeURL: 'Please enter a valid URL address for a gateway'
            })
          })
        const networkId = await firstValueFrom(tempRadix.ledger.networkId())
        persistCustomNodeURL(url)
        await loadURLs()
        nodeToConfirm.value = url
        values.nodeURL = ''
      } catch (error) {
        // Report errors for urls that don't resolve to a radix network
        setErrors({
          nodeURL: 'Please enter a valid URL address for a gateway'
        })
        toast.error('Invalid network, unable to connect')
      }
    }

    const setConfirm = (url: string) => {
      nodeToConfirm.value = url
    }

    const cancelChange = () => {
      nodeToConfirm.value = null
    }

    const confirmChange = () => {
      if (!nodeToConfirm.value) return
      updateConnection(nodeToConfirm.value)
    }

    const submitDisabled: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const showRedHighlight: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty && !meta.value.valid
    })

    const defaultNetworkURLs: ComputedRef<string[]> = computed(() => {
      return defaultNetworks.map((net: ChosenNetworkT) => net.networkURL)
    })
    loadURLs()
    return {
      defaultNetworks,
      defaultNetworkURLs,
      meta,
      showRedHighlight,
      submitDisabled,
      switching,
      values,
      handleAddNode,
      setErrors,
      customNodeURLs,
      loadURLs,
      refreshApp,
      nodeToConfirm,
      setConfirm,
      cancelChange,
      confirmChange
    }
  }
})
</script>
