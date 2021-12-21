<template>
  <AppModal
    :visible="isVisible"
    :title="errorMsg"
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
      <div v-if="showDetails">
        <p class="mb-2">Please contact support at <a class="text-rBlue"
        href="mailto:hello@radixdlt.com">hello@radixdlt.com</a> and provide the following.
        </p>
        <p class="mb-2 flex justify-between">
          <span class="flex-1">Error: {{ error.details.type }}</span>
          <click-to-copy :address="error.details.type" />
        </p>
        <p class="mb-5 flex justify-between">
          <span class="flex-1">Trace ID: {{ error.trace_id }}</span>
          <click-to-copy :address="error.trace_id" />
        </p>
      </div>
      <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('errors.closeModal') }}</AppButtonCancel>
        <AppButtonCancel @click="refreshApp" class="w-44">{{ $t('errors.refreshApp') }}</AppButtonCancel>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, toRef, watch } from 'vue'
import { Amount } from '@radixdlt/application'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppModal from '@/components/AppModal.vue'
import { useRouter } from 'vue-router'
import { useWallet, useErrors } from '@/composables'
import { refreshApp } from '@/actions/vue/general'
import { useI18n } from 'vue-i18n'
import { asBigNumber } from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { add } from '@/helpers/arithmetic'

export default defineComponent({
  components: {
    AppButtonCancel,
    AppModal,
    ClickToCopy
  },

  props: {
    error: {
      type: Object,
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
    const { clearLatestError, isApiError } = useErrors(radix)
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
    const type: string = error.value?.details?.type
    const showDetails = !isApiError(type)
    let errorMsg: string
    if (showDetails) {
      errorMsg = 'Unexpected Error'
    } else if (type === 'BelowMinimumStakeError') {
      const minimum = error.value.details?.minimum_amount?.value
      const displayMinimum = minimum ? asBigNumber(minimum) : '10'
      errorMsg = t(`apiErrors.${type}`, { minimum: displayMinimum })
    } else if (type === 'NotEnoughTokensForUnstakeError') {
      const requested = Amount.fromUnsafe(error.value.details.requested_amount.value)._unsafeUnwrap()
      const staked = Amount.fromUnsafe(error.value.details.stake.delegated_stake.value)._unsafeUnwrap()
      const pending = Amount.fromUnsafe(error.value.details.pending_stake.delegated_stake.value)._unsafeUnwrap()
      if (requested > add(staked, pending)) {
        errorMsg = t(`apiErrors.${type}.default`)
      } else {
        errorMsg = t(`apiErrors.${type}.pending`, { pending: asBigNumber(pending) })
      }
    } else {
      errorMsg = t(`apiErrors.${type}`)
    }

    return {
      handleClose,
      isVisible,
      refreshApp,
      updateVisible,
      errorMsg,
      showDetails
    }
  }
})
</script>
