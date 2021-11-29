<template>
  <div data-ci="create-wallet-create-passcode-component">
    <form class="flex flex-col w-96" @submit.prevent="$emit('confirm', values.password)">
      <div class="mb-14">
        <PasswordField
          name="password"
          :placeholder="$t('createWallet.passwordPlaceholder')"
          rules="required"
          data-ci="create-wallet-passcode-input"
        />
        <FormErrorMessage name="password" />
      </div>

      <div class="mb-56">
        <PasswordField
          name="confirmation"
          :placeholder="$t('createWallet.passwordConfirmationPlaceholder')"
          rules="required|confirmed:@password"
          data-ci="create-wallet-confirm-input"
        />
        <FormErrorMessage name="confirmation" />
      </div>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        {{ $t('createWallet.passwordButton') }}
      </ButtonSubmit>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import PasswordField from '@/components/PasswordField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface PasswordForm {
  password: string;
  confirm: string;
}

const CreateWalletCreatePasscode = defineComponent({
  components: {
    ButtonSubmit,
    FormErrorMessage,
    PasswordField
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
