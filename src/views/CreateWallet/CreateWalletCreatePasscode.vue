<template>
  <div data-ci="create-wallet-create-passcode-component">
    <button
      @click="$emit('back')"
      type="button"
      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Back
    </button>

    <p class="mb-4">
      Please enter a secure password here. This password secures your mnemonicly generated key, and will be required every time you open this application
    </p>

    <form>
      <Field
        type="password"
        name="password"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-4"
        placeholder="enter password"
        rules="required"
        data-ci="create-wallet-passcode-input"
      ></Field>
      <ErrorMessage name="password" />

      <Field
        type="password"
        name="confirmation"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-4"
        placeholder="confirm password"
        rules="required|confirmed:@password"
        data-ci="create-wallet-confirm-input"
      ></Field>
      <ErrorMessage name="confirmation" />
    </form>

    <button
      @click="$emit('confirm')"
      type="button"
      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      :class="{ 'bg-indigo-200 cursor-not-allowed': disableSubmit, 'bg-indigo-600 hover:bg-indigo-700': !disableSubmit }"
      :disabled="disableSubmit"
    >
      Confirm password
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

  emits: ['confirm', 'back']
})

export default CreateWalletCreatePasscode
</script>
