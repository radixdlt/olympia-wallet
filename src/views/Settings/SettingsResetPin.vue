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
    <div class="text-rGrayDark mb-4">{{ $t('settings.currentPinLabel') }}</div>

    <pin-input
      name="Current PIN"
      :values="values.currentPin"
      :autofocus="activePin === 0"
      class="mb-8 max-w-sm"
      data-ci="current-pin"
      @finished="handleValidatePin"
      @unfinished="handleUnfinishedPin"
      @click="activePin = 0"
    >
    </pin-input>

    <div class="text-rGrayDark mb-4">{{ $t('settings.pinLabel') }}</div>
    <pin-input
      name="New PIN"
      :values="values.pin"
      :autofocus="activePin === 1"
      class="mb-8 max-w-sm"
      data-ci="pin"
      @finished="activePin = 2"
      @click="activePin = 1"
    >
    </pin-input>

    <div class="text-rGrayDark mb-4">{{ $t('settings.confirmationPinLabel') }}</div>
    <pin-input
      name="Confirmation PIN"
      :values="values.confirmation"
      :autofocus="activePin === 2"
      class="mb-8 max-w-sm"
      data-ci="confirmation"
      @finished="handleComparePin"
      @unfinished="handleUnfinishedPin"
      @click="activePin = 2"
    >
    </pin-input>

    <ButtonSubmit class="w-72 mx-auto" :disabled="disableSubmit">
      {{ $t('transaction.confirmButton') }}
    </ButtonSubmit>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'
import { storePin, validatePin } from '@/actions/vue/create-wallet'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface ResetPinForm {
  currentPin: string;
  pin: string;
  confirmation: string;
}

const SettingsResetPin = defineComponent({
  components: {
    ButtonSubmit,
    PinInput
  },

  setup () {
    const { errors, meta, values, setErrors, resetForm } = useForm<ResetPinForm>()

    return { errors, meta, values, setErrors, resetForm }
  },

  data () {
    return {
      activePin: 0,
      isValidPin: false
    }
  },

  computed: {
    disableSubmit (): boolean {
      if (!this.isValidPin) {
        return true
      } else {
        return this.meta.dirty ? !this.meta.valid : true
      }
    }
  },

  methods: {
    handleValidatePin () {
      validatePin(this.values.currentPin)
        .then((isValid: boolean) => {
          if (!isValid) {
            this.resetForm()
            this.setErrors({
              currentPin: this.$t('validations.invalidPin')
            })
          } else {
            this.activePin = 1
          }
        })
    },
    handleUnfinishedPin () {
      this.isValidPin = false
    },

    handleComparePin () {
      if (this.values.pin === this.values.confirmation) {
        this.isValidPin = true
      } else {
        this.setErrors({
          confirmation: this.$t('validations.pinMatch')
        })
      }
    },

    handleResetPin () {
      if (this.values.pin !== this.values.confirmation) {
        this.setErrors({
          confirmation: this.$t('validations.pinMatch')
        })
        this.activePin = 2
      } else {
        this.isValidPin = false
        storePin(this.values.pin)
          .then(() => this.resetForm())
      }
    }
  }
})

export default SettingsResetPin
</script>
