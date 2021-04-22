<template>
  <div data-ci="create-wallet-create-passcode-component">
    <form class="flex flex-col w-96">
      <div class="mb-14">
        <FormField
          type="password"
          name="password"
          class="w-full"
          :placeholder="$t('createWallet.passwordPlaceholder')"
          rules="required"
          data-ci="create-wallet-passcode-input"
        />
        <FormErrorMessage name="password" />
      </div>

      <div class="mb-56">
        <FormField
          type="password"
          name="confirmation"
          class="w-full"
          :placeholder="$t('createWallet.passwordConfirmationPlaceholder')"
          rules="required|confirmed:@password"
          data-ci="create-wallet-confirm-input"
        />
        <FormErrorMessage name="confirmation" />
      </div>
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
import { useForm } from 'vee-validate'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'

interface PasswordForm {
  password: string;
  confirm: string;
}

const CreateWalletCreatePasscode = defineComponent({
  components: {
    FormField,
    FormErrorMessage
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
