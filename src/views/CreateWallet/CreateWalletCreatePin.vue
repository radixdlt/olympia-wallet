<template>
  <div data-ci="create-wallet-create-pin-component">
    <form @submit.prevent="handleSubmit">
      <div class="text-rGrayDark text-base mb-7">{{ $t('createWallet.newPinLabel') }}</div>
      <pin-input
        name="pin"
        :values="values.pin"
        :autofocus="updatingFirstInput"
        :large="true"
        @finished="handleFinished"
        class="mb-14 max-w-sm"
        data-ci="create-wallet-pin-input"
      >
      </pin-input>
      <div class="text-rGrayDark text-base mb-7">{{ $t('createWallet.confirmPinLabel') }}</div>
      <pin-input
        name="pinConfirmation"
        :values="values.pinConfirmation"
        :autofocus="!updatingFirstInput"
        :large="true"
        class="mb-36 max-w-sm"
        data-ci="create-wallet-confirm-input"
      >
      </pin-input>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        {{ $t('createWallet.pinButton') }}
      </ButtonSubmit>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface PasswordForm {
  pin: string;
  pinConfirmation: string;
}

const CreateWalletCreatePin = defineComponent({
  components: {
    ButtonSubmit,
    PinInput
  },

  setup () {
    const { errors, values, meta, resetForm, setErrors } = useForm<PasswordForm>()

    return {
      errors,
      values,
      meta,
      resetForm,
      setErrors
    }
  },

  data () {
    return {
      updatingFirstInput: true
    }
  },

  computed: {
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    handleFinished (key: string) {
      if (key === 'pin') {
        this.updatingFirstInput = false
        this.$emit('enteredPin', true)
      } else {
        this.updatingFirstInput = true
        this.$emit('enteredPin', false)
      }
    },
    handleSubmit () {
      if (this.values.pin !== this.values.pinConfirmation) {
        this.setErrors({
          pinConfirmation: this.$t('validations.pinMatch')
        })
      } else {
        this.$emit('confirm', this.values.pin)
      }
    }
  },

  emits: ['confirm', 'enteredPin']
})

export default CreateWalletCreatePin
</script>
