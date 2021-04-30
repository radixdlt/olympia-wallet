<template>
  <div data-ci="create-wallet-create-passcode-component">
    <p class="text-rBlack text-base text-center mb-10">{{ $t('home.passwordTitle') }}</p>
    <form @submit.prevent="$emit('submit', values.password)" class="flex flex-col w-96 relative">
      <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 opacity transition-opacity" :class="{'opacity-40': disableSubmit}">
        <path d="M3.98975 12.1227V8.91388C3.98975 4.54318 7.55907 1 11.962 1C16.3649 1 19.9342 4.54318 19.9342 8.91388V12.1227" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M1 30.3952V11.8662H4.23024H19.7567H22.9869V29.4213H5.57166" stroke="#052CC0" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>

      <div class="mb-6 flex flex-col">
        <FormField
          type="password"
          name="password"
          class="pl-8"
          :placeholder="$t('home.passwordPlaceholder')"
          rules="required"
          data-ci="create-wallet-passcode-input"
        />
        <FormErrorMessage name="password" class="mt-4 text-sm text-red-400" />
      </div>

      <div class="text-rBlack pb-6 text-xs">
        <p class="text-rRed font-bold uppercase"> Warning: </p>
        <p> This wallet connects to a temporary Radix betanet test network only. All tokens and transactions in this wallet are for testing purposes only. Tokens you see in this wallet have no value, and you cannot use it to hold real eXRD or XRD tokens. </p>
      </div>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        {{ $t('home.passwordButton') }}
      </ButtonSubmit>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface PasswordForm {
  password: string;
}

const HomeEnterPasscode = defineComponent({
  components: {
    ButtonSubmit,
    FormField,
    FormErrorMessage
  },

  setup () {
    const { errors, values, meta, setErrors } = useForm<PasswordForm>()

    return {
      errors,
      values,
      meta,
      setErrors
    }
  },

  computed: {
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  emits: ['submit']
})

export default HomeEnterPasscode
</script>
