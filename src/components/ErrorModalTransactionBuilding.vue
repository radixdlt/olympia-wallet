<template>
  <AppModal
    :visible="isVisible"
    :title="$t('errors.transactionBuildingErrorTitle')"
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
      <div v-if="error.type === 'UNABLE_TO_PREPARE_TX' && transactionType === 'TRANSFER'" class="text-left px-5 mb-5 text-sm">
        <p class="mb-2 font-medium">{{ $t('errors.unableToPrepareTransferTransactionTitle') }}</p>
        <ul class="list-disc text-sm pl-4">
          <li>{{ $t('errors.unableToPrepareTransferTransactionPointOne') }}</li>
          <li>{{ $t('errors.unableToPrepareTransferTransactionPointTwo') }}</li>
        </ul>
      </div>
      <div v-else-if="error.type === 'UNABLE_TO_PREPARE_TX' && transactionType === 'STAKING' && activeForm === 'STAKING'" class="text-left px-5 mb-5 text-sm">
        <p class="mb-2 font-medium">{{ $t('errors.unableToPrepareStakingTransactionTitle') }}</p>
        <ul class="list-disc text-sm pl-4">
          <li>{{ $t('errors.unableToPrepareStakingTransactionPointOne') }}</li>
          <li>{{ $t('errors.unableToPrepareStakingTransactionPointTwo') }}</li>
          <li>{{ $t('errors.unableToPrepareStakingTransactionPointThree') }}</li>
        </ul>
      </div>
      <div v-else-if="error.type === 'UNABLE_TO_PREPARE_TX' && transactionType === 'STAKING' && activeForm === 'UNSTAKING'" class="text-left px-5 mb-5 text-sm">
        <p class="mb-2 font-medium">{{ $t('errors.unableToPrepareUnstakingTransactionTitle') }}</p>
        <ul class="list-disc text-sm pl-4">
          <li>{{ $t('errors.unableToPrepareUnstakingTransactionPointOne') }}</li>
          <li>{{ $t('errors.unableToPrepareUnstakingTransactionPointTwo') }}</li>
          <li>{{ $t('errors.unableToPrepareUnstakingTransactionPointThree') }}</li>
        </ul>
      </div>
      <p v-else class="mb-5">{{ error }}</p>
      <div class="flex flex-row space-x-5 justify-center">
        <AppButtonCancel @click="handleClose" class="w-44">{{ $t('errors.closeModal') }}</AppButtonCancel>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, Ref, ref, toRef, watch } from 'vue'
import AppButtonCancel from '@/components/AppButtonCancel.vue'
import AppModal from '@/components/AppModal.vue'
import { ErrorT } from '@radixdlt/application'
import { useRouter } from 'vue-router'
import { useWallet, useErrors, useStaking } from '@/composables'

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
    const { activeForm } = useStaking(radix)

    const transactionType: ComputedRef<'TRANSFER' | 'STAKING'> = computed(() => {
      if (router.currentRoute.value.fullPath.indexOf('staking') >= 0) return 'STAKING'
      else return 'TRANSFER'
    })

    watch((error), (newErrorVal) => {
      if (newErrorVal) isVisible.value = true
    })

    const handleClose = () => {
      clearLatestError()
      // Clear latest error but leave modal open if there are more errors in the list
      // Close modal if this is the last error
      if (props.errorsCount <= 1) isVisible.value = false
    }

    return {
      activeForm,
      isVisible,
      transactionType,
      handleClose,
      updateVisible
    }
  }
})
</script>
