<template>
  <AppModal
    :visible="isVisible"
    :title="errorTitle"
  >
    <template v-slot:icon>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="transform rotate-45">
      <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
      <path d="M25 14V36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 25H36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </template>
    <template v-slot:content>
      <div v-if="errorsCount > 1" class="absolute top-0 right-0">
        <div class="bg-rRed rounded-full inline-block px-2 py-0.5 m-2 text-white text-sm">{{ errorsCount }}</div>
      </div>
      <p class="mb-5">{{ errorMsg }}</p>
      <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('errors.closeModal') }}</AppButtonCancel>
        <AppButtonCancel @click="refreshApp" class="w-44">{{ $t('errors.refreshApp') }}</AppButtonCancel>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, toRef, watch } from 'vue'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppModal from '@/components/AppModal.vue'
import { ErrorT } from '@radixdlt/application'
import { useRouter } from 'vue-router'
import { useWallet, useErrors } from '@/composables'
import { refreshApp } from '@/actions/vue/general'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    AppButtonCancel,
    AppModal
  },

  props: {
    error: {
      type: Object as PropType<ErrorT<'wallet'>>,
      required: true
    },
    errorsCount: {
      type: Number,
      required: true
    }
  },

  setup (props) {
    const isVisible: Ref<boolean> = ref(true)
    const updateVisible = () => { isVisible.value = !isVisible.value }
    const error = toRef(props, 'error')
    const router = useRouter()
    const { radix } = useWallet(router)
    const { clearLatestError } = useErrors(radix)
    const { t } = useI18n()

    watch((error), (newErrorVal) => {
      if (newErrorVal) isVisible.value = true
    })

    const handleClose = () => {
      clearLatestError()
      // Clear latest error but leave modal open if there are more errors in the list
      // Close modal if this is the last error
      if (props.errorsCount <= 1) isVisible.value = false
    }
    const type: string = error.value.category
    let errorMsg: string = t('errors.hardwareErrorDetails')
    let errorTitle: string = t('errors.genericErrorTitle')
    if (type) {
      switch (type) {
        case 'SignatureTimedOut': {
          errorTitle = t('errors.hardwareSignatureErrorTitle')
          errorMsg = t('errors.hardwareSignatureTimedOut')
          break
        }
        case 'UserRejectedSignature': {
          errorTitle = t('errors.hardwareSignatureErrorTitle')
          errorMsg = t('errors.hardwareUserRejectedSignature')
          break
        }
      }
    }

    return {
      errorMsg,
      errorTitle,
      handleClose,
      isVisible,
      refreshApp,
      updateVisible
    }
  }
})
</script>
