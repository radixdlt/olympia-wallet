<template>
  <form
    @submit.prevent="handleResetPin"
    class="p-6"
  >
    <div class="text-rGrayDark text-sm mb-6 w-full max-w-md">
      {{ $t('settings.resetPinDisclaimer') }}
      <br />
      {{ $t('settings.resetPinDisclaimerTwo') }}
    </div>
    <div class="w-96 mb-2">
      <PasswordField
        name="password"
        :placeholder="$t('settings.passwordRequiredLabel')"
        rules="required"
        data-ci="create-wallet-passcode-input"
        :validateOnInput="true"
        @blur="activePin = 1"
        @click="activePin = 0"
      />
      <FormErrorMessage name="password" />
    </div>

    <div class="text-rGrayDark mt-12 mb-2">{{ $t('settings.pinLabel') }}</div>
    <pin-input
      name="pin"
      :values="values.pin"
      :autofocus="activePin === 1"
      class="mb-6 max-w-sm"
      data-ci="pin"
      @finished="activePin = 2"
      @click="activePin = 1"
      :required=false
    >
    </pin-input>

    <div class="text-rGrayDark mb-4">{{ $t('settings.confirmationPinLabel') }}</div>
    <pin-input
      name="confirmationPin"
      :values="values.confirmationPin"
      :autofocus="activePin === 2"
      class="mb-6 max-w-sm"
      data-ci="confirmation"
      @finished="handleComparePin"
      @unfinished="handleUnfinishedPin"
      @click="activePin = 2"
      :required=false
    >
    </pin-input>

    <ButtonSubmit class="w-72 mx-auto mt-8" :disabled="disableSubmit">
      {{ $t('settings.confirm') }}
    </ButtonSubmit>
    <div v-if="updatedPin" class="text-rGrayDark text-sm mt-4">
      {{ $t('settings.updatedPIN') }}
    </div>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'
import { storePin, touchKeystore } from '@/actions/vue/create-wallet'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import PasswordField from '@/components/PasswordField.vue'
import { Result } from 'neverthrow'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import { Keystore, KeystoreT } from '@radixdlt/application'
import { useI18n } from 'vue-i18n'

interface ResetPinForm {
  password: string;
  pin: string;
  confirmationPin: string;
}

const SettingsResetPin = defineComponent({
  components: {
    ButtonSubmit,
    PasswordField,
    PinInput,
    FormErrorMessage
  },

  setup () {
    const { errors, meta, values, setErrors, resetForm } = useForm<ResetPinForm>()
    const { t } = useI18n()
    const activePin = ref(0)
    const isValidPin = ref(false)
    const updatedPin = ref(false)
    const resetFormForNonmatchingPins = () => {
      console.log('??')
      const newValues = { password: values.password, pin: '', confirmationPin: '' }
      const newErrors = { confirmationPin: t('validations.pinMatch') }
      resetForm({ values: newValues, errors: newErrors })
      activePin.value = 1
    }

    const handleComparePin = () => {
      if (values.pin === values.confirmationPin) {
        isValidPin.value = true
      } else {
        resetFormForNonmatchingPins()
      }
    }

    const handleUnfinishedPin = () => {
      isValidPin.value = false
    }

    const handleResetPin = async () => {
      if (values.pin !== values.confirmationPin) {
        resetFormForNonmatchingPins()
        return Promise.resolve()
      }
      try {
        const keystore = await touchKeystore()
        const decryptedResult = await Keystore.decrypt({ keystore, password: values.password })
        if (decryptedResult.isOk()) {
          const storePinResult = await storePin(values.pin)
          resetForm()
          updatedPin.value = true
        } else {
          setErrors({ password: t('validations.incorrectPassword') })
        }
      } catch {
        setErrors({ password: t('validations.incorrectPassword') })
      }
    }

    const disableSubmit = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    return {
      /* refs */
      activePin,
      isValidPin,
      updatedPin,
      errors,
      meta,
      values,

      /* functions */
      setErrors,
      resetForm,
      handleComparePin,
      handleUnfinishedPin,
      handleResetPin,

      /* computed */
      disableSubmit
    }
  }
})

export default SettingsResetPin
</script>
