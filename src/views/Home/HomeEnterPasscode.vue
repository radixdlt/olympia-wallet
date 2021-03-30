<template>
  <div data-ci="create-wallet-create-passcode-component">
    <p class="text-rBlack text-base text-center mb-10">{{ $t('home.passwordTitle') }}</p>
    <form class="flex flex-col w-96 relative">
      <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 opacity transition-opacity" :class="{'opacity-40': disableSubmit}">
        <path d="M3.98975 12.1227V8.91388C3.98975 4.54318 7.55907 1 11.962 1C16.3649 1 19.9342 4.54318 19.9342 8.91388V12.1227" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M1 30.3952V11.8662H4.23024H19.7567H22.9869V29.4213H5.57166" stroke="#052CC0" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>

      <div class="mb-10 flex flex-col">
        <Field
          type="password"
          name="password"
          class="focus:outline-none focus:ring-transparent focus:shadow-none border-t-0 border-l-0 border-r-0 border-b border-rBlack pl-8"
          :placeholder="$t('home.passwordPlaceholder')"
          rules="required"
          data-ci="create-wallet-passcode-input"
        ></Field>
        <ErrorMessage name="password" class="mt-4 text-sm text-red-400" />
      </div>
    </form>

    <button
      @click="$emit('submit', values.password)"
      type="button"
      class="inline-flex items-center justify-center px-6 py-5 border font-normal leading-snug rounded w-96 transition-colors"
      :class="{ 'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': disableSubmit, 'bg-rGreen border-rGreen text-white': !disableSubmit }"
      :disabled="disableSubmit"
    >
      {{ $t('home.passwordButton') }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'

interface PasswordForm {
  password: string;
}

const HomeEnterPasscode = defineComponent({
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

  emits: ['submit']
})

export default HomeEnterPasscode
</script>
