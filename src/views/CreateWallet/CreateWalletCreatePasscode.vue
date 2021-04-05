<template>
  <div data-ci="create-wallet-create-passcode-component">
    <form class="flex flex-col w-96">
      <Field
        type="password"
        name="password"
        class="focus:outline-none focus:ring-transparent focus:shadow-none border-t-0 border-l-0 border-r-0 border-b border-rBlack mb-14"
        :placeholder="$t('createWallet.passwordPlaceholder')"
        rules="required"
        data-ci="create-wallet-passcode-input"
      ></Field>
      <ErrorMessage name="password" />

      <Field
        type="password"
        name="confirmation"
        class="focus:outline-none focus:ring-transparent focus:shadow-none border-t-0 border-l-0 border-r-0 border-b border-rBlack mb-56"
        :placeholder="$t('createWallet.passwordConfirmationPlaceholder')"
        rules="required|confirmed:@password"
        data-ci="create-wallet-confirm-input"
      ></Field>
      <ErrorMessage name="confirmation" />
    </form>

    <button
      @click="$emit('confirm', values.password)"
      type="button"
      class="inline-flex items-center justify-center px-6 py-5 border font-normal leading-snug rounded w-96"
      :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disableSubmit, 'bg-rGreen border-rGreen text-white': !disableSubmit }"
      :disabled="disableSubmit"
    >
      {{ $t('createWallet.passwordButton') }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'

interface PasswordForm {
  password: string;
  confirm: string;
}

const CreateWalletCreatePasscode = defineComponent({
  components: {
    Field,
    ErrorMessage
  },

  setup () {
    const { errors, values, meta } = useForm<PasswordForm>()

    return {
      errors,
      values,
      meta
    }
  },

  computed: {
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  emits: ['confirm']
})

export default CreateWalletCreatePasscode
</script>
