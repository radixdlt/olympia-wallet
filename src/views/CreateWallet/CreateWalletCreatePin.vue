<template>
  <div data-ci="create-wallet-create-pin-component">
    <form @submit.prevent="handleSubmit">
      <div class="text-rGrayDark text-base mb-7">{{ $t('createWallet.newPinLabel') }}</div>
      <pin-input
        name="pin"
        :values="values.pin"
        :autofocus="activePin === 1"
        :large="true"
        @click="firstPinClicked"
        @finished="activePin = 2"
        class="mb-14 max-w-sm"
        data-ci="create-wallet-pin-input"
      >
      </pin-input>
      <div class="text-rGrayDark text-base mb-7">{{ $t('createWallet.confirmPinLabel') }}</div>
      <pin-input
        name="pinConfirmation"
        :values="values.pinConfirmation"
        :autofocus="activePin === 2"
        :large="true"
        class="mb-36 max-w-sm"
        @finished="handleComparePin"
        @unfinished="handleUnfinishedPin"
        @click="secondPinClicked"
        data-ci="create-wallet-confirm-input"
        :rules="['required','confirmed:pin']"
      >
      </pin-input>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        {{ $t('createWallet.pinButton') }}
      </ButtonSubmit>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useI18n } from 'vue-i18n'

interface PasswordForm {
  pin: string;
  pinConfirmation: string;
}

const CreateWalletCreatePin = defineComponent({
  components: {
    ButtonSubmit,
    PinInput
  },

  setup (props, context) {
    const { errors, values, meta, resetForm, setErrors } = useForm<PasswordForm>()
    const { t } = useI18n()

    const activePin = ref(0)
    const isValidPin = ref(false)

    const resetFormForNonmatchingPins = () => {
      const newValues = { pin: '', pinConfirmation: '' }
      const newErrors = { pinConfirmation: t('validations.pinMatch') }
      resetForm({ values: newValues, errors: newErrors })
      activePin.value = 1
    }

    const handleComparePin = () => {
      if (values.pin === values.pinConfirmation) {
        isValidPin.value = true
      } else {
        resetFormForNonmatchingPins()
      }
    }

    const handleUnfinishedPin = () => {
      isValidPin.value = false
    }

    const handleSubmit = async () => {
      if (values.pin !== values.pinConfirmation) {
        resetFormForNonmatchingPins()
        return Promise.resolve()
      }
      context.emit('confirm', values.pin)
    }

    const disableSubmit = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const firstPinClicked = () => {
      const newValues = { pin: '', pinConfirmation: '' }
      resetForm({ values: newValues })
      activePin.value = 1
    }

    const secondPinClicked = () => {
      const newValues = { ...values, pinConfirmation: '' }
      resetForm({ values: newValues })
      activePin.value = 2
    }

    return {
      activePin,
      errors,
      values,
      meta,
      disableSubmit,
      resetForm,
      setErrors,
      handleComparePin,
      handleUnfinishedPin,
      handleSubmit,
      firstPinClicked,
      secondPinClicked
    }
  }
})

export default CreateWalletCreatePin
</script>
