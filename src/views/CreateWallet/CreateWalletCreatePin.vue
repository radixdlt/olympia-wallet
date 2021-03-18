<template>
  <div data-ci="create-wallet-create-pin-component">
    <form>
      <pin-input
        name="pin"
        :values="values.pin"
        :autofocus="updatingFirstInput"
        @finished="handleFinished"
        class="mb-14"
        data-ci="create-wallet-pin-input"
      >
      </pin-input>
      <pin-input
        name="confirmation"
        :values="values.confirmation"
        :autofocus="!updatingFirstInput"
        class="mb-48"
        data-ci="create-wallet-confirm-input"
      >
      </pin-input>
    </form>

    <button
      @click="$emit('confirm')"
      type="button"
      class="inline-flex items-center justify-center px-6 py-5 border font-normal leading-snug rounded w-96"
      :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disableSubmit, 'bg-rGreen border-rGreen text-white': !disableSubmit }"
      :disabled="disableSubmit"
    >
      Confirm PIN
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import PinInput from '@/components/PinInput.vue'

interface PasswordForm {
  pin: string;
  confirm: string;
}

const CreateWalletCreatePin = defineComponent({
  components: {
    PinInput
  },

  setup () {
    const { errors, values, meta, resetForm } = useForm<PasswordForm>()

    return {
      errors,
      values,
      meta,
      resetForm
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
    }
  },

  emits: ['confirm', 'enteredPin']
})

export default CreateWalletCreatePin
</script>
