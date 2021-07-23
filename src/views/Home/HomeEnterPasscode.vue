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
          id="password"
        />
      </div>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        {{ $t('home.passwordButton') }}
      </ButtonSubmit>
      <div>
        <a @click="this.$emit('forgotPassword')" class="w-96 text-rGrayMed text-sm text-center py-4 block">{{ $t('home.forgotPassword')}}</a>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm } from 'vee-validate'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface PasswordForm {
  password: string;
}

const HomeEnterPasscode = defineComponent({
  components: {
    ButtonSubmit,
    FormField
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

  mounted () {
    const passEl = document.getElementById('password')
    if (passEl) passEl.focus()
  },

  emits: ['submit', 'forgotPassword']
})

export default HomeEnterPasscode
</script>
