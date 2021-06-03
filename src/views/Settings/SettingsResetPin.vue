<template>
  <form
    @submit.prevent="handleResetPin"
    class="p-10"
  >
    <div class="text-rGrayDark text-sm mb-11 w-full max-w-md">
      {{ $t('settings.resetPinDisclaimer') }}
      <br /><br />
      {{ $t('settings.resetPinDisclaimerTwo') }}
    </div>
    <div class="text-rGrayDark mb-4">{{ $t('settings.passwordRequiredLabel') }}</div>

    <FormField
      type="password"
      name="password"
      class="w-96 mb-2"
      :placeholder="$t('settings.passwordPlaceholder')"
      rules="required"
      data-ci="create-wallet-passcode-input"
      @blur="activePin = 1"
      @click="activePin = 0"
    />
    <FormErrorMessage name="password" />

    <div class="text-rGrayDark mt-12 mb-2">{{ $t('settings.pinLabel') }}</div>
    <pin-input
      name="pin"
      :values="values.pin"
      :autofocus="activePin === 1"
      class="mb-8 max-w-sm"
      data-ci="pin"
      @finished="activePin = 2"
      @click="activePin = 1"
      :required=false
    >
    </pin-input>

    <div class="text-rGrayDark mb-4">{{ $t('settings.confirmationPinLabel') }}</div>
    <pin-input
      name="confirmationPin"
      :values="values.confirmation"
      :autofocus="activePin === 2"
      class="mb-8 max-w-sm"
      data-ci="confirmation"
      @finished="handleComparePin"
      @unfinished="handleUnfinishedPin"
      @click="activePin = 2"
      :required=false
    >
    </pin-input>

    <ButtonSubmit class="w-72 mx-auto mt-8" :disabled="disableSubmit">
      {{ $t('transaction.confirmButton') }}
    </ButtonSubmit>
    <div v-if="updatedPin" class="text-rGrayDark text-sm mt-4">
      {{ $t('settings.updatedPIN') }}
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'
import { storePin, touchKeystore } from '@/actions/vue/create-wallet'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import FormField from '@/components/FormField.vue'
import { Result } from 'neverthrow'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import { Keystore, KeystoreT } from '@radixdlt/application'

interface ResetPinForm {
  password: string;
  pin: string;
  confirmationPin: string;
}

const SettingsResetPin = defineComponent({
  components: {
    ButtonSubmit,
    PinInput,
    FormField,
    FormErrorMessage
  },

  setup () {
    const { errors, meta, values, setErrors, resetForm } = useForm<ResetPinForm>()

    return { errors, meta, values, setErrors, resetForm }
  },

  data () {
    return {
      activePin: 0,
      isValidPin: false,
      updatedPin: false
    }
  },

  computed: {
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    resetFormForNonmatchingPins () {
      const values = { password: this.values.password, pin: '', confirmationPin: '' }
      const errors = { confirmationPin: this.$t('validations.pinMatch') }
      this.resetForm({
        values: values,
        errors: errors
      })
      this.activePin = 1
    },

    handleComparePin () {
      if (this.values.pin === this.values.confirmationPin) {
        this.isValidPin = true
      } else {
        this.resetFormForNonmatchingPins()
      }
    },

    handleUnfinishedPin () {
      this.isValidPin = false
    },

    handleResetPin () {
      if (this.values.pin !== this.values.confirmationPin) {
        this.resetFormForNonmatchingPins()
      } else {
        touchKeystore()
          .then((keystore: KeystoreT) =>
            Keystore.decrypt({
              keystore,
              password: this.values.password
            })
          )
          .then((res: Result<Buffer, Error>) => {
            if (res.isOk()) {
              storePin(this.values.pin)
                .then(() => {
                  this.resetForm()
                  this.updatedPin = true
                })
            } else {
              this.setErrors({
                password: this.$t('validations.incorrectPassword')
              })
            }
          })
          .catch(() => {
            this.setErrors({
              password: this.$t('validations.incorrectPassword')
            })
          })
      }
    }
  }
})

export default SettingsResetPin
</script>
