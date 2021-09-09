<template>
  <div class="pt-6 px-6 pb-4">
    <div class="text-rGrayDark text-sm mb-7 w-full max-w-xl">
      <p>{{ $t('settings.nodeDisclaimer') }}</p>
      <p class="mt-2">{{ $t('settings.nodeDisclaimerWarning') }}</p>
    </div>
    <div class="flex flex-row flex-wrap relative">
      <NodeListItem
        v-for="(url, i) in defaultNetworkUrls"
        :key="i"
        :url="url"
      />

       {{ '' && 'To Do: Render other saved networks from electron storage here' }}

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
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import { ChosenNetworkT, defaultNetworks } from '@/helpers/network'
import NodeListItem from '@/components/NodeListItem.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import { useForm } from 'vee-validate'
import { Network, Radix } from '@radixdlt/application'
import { Subscription } from 'rxjs'
import { useToast } from 'vue-toastification'

interface AddNodeForm {
  nodeURL: string;
}

export default defineComponent({
  components: {
    FormField,
    FormErrorMessage,
    NodeListItem
  },

  setup () {
    const { values, meta, setErrors } = useForm<AddNodeForm>()
    const subs = new Subscription()
    const toast = useToast()

    const handleAddNode = () => {
      // First, try to get a vaild networkId from network URL
      const tempRadix = Radix.create()

      subs.add(tempRadix.ledger.networkId().subscribe({
        next: (networkId: Network) => {
          // Connect true radix instance to new node if successful
          // props.radixConnectService.connectToNode(values.nodeURL, Network.STOKENET) // Set the identifier some other way
          toast.success(`validated nodeURL has id of: ${networkId}`)

          // To Do: Store valid url in electron storage
        },
        error: () => {
          // Present user with an error if not
          setErrors({
            nodeURL: 'Please enter a valid URL address'
          })
          toast.error('Invalid network, unable to connect')
        }
      }))
      tempRadix.connect(values.nodeURL)
    }

    const submitDisabled: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const showRedHighlight: ComputedRef<boolean> = computed(() => {
      return meta.value.dirty && !meta.value.valid
    })

    const defaultNetworkUrls: ComputedRef<string[]> = computed(() => {
      return defaultNetworks.map((net: ChosenNetworkT) => net.networkURL)
    })

    return {
      defaultNetworkUrls,
      setErrors,
      values,
      meta,
      submitDisabled,
      showRedHighlight,
      handleAddNode
    }
  }
})
</script>
