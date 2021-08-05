<template>
  <form class="p-6 flex flex-col max-w-lg w-full" @submit.prevent="handleSubmit">
    <div class="text-rGrayDark text-sm mb-8 w-full max-w-lg">
      {{ $t('settings.resetPasswordDisclaimer') }}
      <br /><br />
      {{ $t('settings.resetPasswordInstructions') }}
    </div>

    <div class="mb-14">
      <FormField
        type="password"
        name="currentPassword"
        class="w-full"
        :placeholder="$t('settings.currentPasswordPlaceholder')"
        rules="required"
        :label="$t('settings.currentPasswordLabel')"
        data-ci="create-wallet-passcode-input"
      />
      <FormErrorMessage name="currentPassword" />
    </div>

    <div class="mb-14">
      <FormField
        type="password"
        name="password"
        class="w-full"
        :placeholder="$t('settings.newPasswordLabel')"
        rules="required"
        data-ci="create-wallet-passcode-input"
      />
      <FormErrorMessage name="password" />
    </div>

    <div class="mb-8">
      <FormField
        type="password"
        name="confirmation"
        class="w-full"
        :placeholder="$t('settings.confirmPasswordLabel')"
        rules="required|confirmed:@password"
        data-ci="create-wallet-confirm-input"
      />
      <FormErrorMessage name="confirmation" />
    </div>

    <ButtonSubmit class="w-96" :disabled="disableSubmit">
      {{ $t('createWallet.passwordButton') }}
    </ButtonSubmit>
    <div v-if="updatedPassword" class="text-rGrayDark text-sm mt-4">
      {{ $t('settings.updatedPassword') }}
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, Ref } from 'vue'
import { useForm } from 'vee-validate'
import { Radix, mockedAPI, Keystore, KeystoreT, MnemomicT, Network } from '@radixdlt/application'
import { Result } from 'neverthrow'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { touchKeystore, initWallet } from '@/actions/vue/create-wallet'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { radixConnection } from '@/helpers/network'

interface PasswordForm {
  currentPassword: string;
  password: string;
  confirmation: string;
}

const SettingsResetPassword = defineComponent({
  components: {
    ButtonSubmit,
    FormField,
    FormErrorMessage
  },

  async setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<PasswordForm>()
    const store = useStore()
    const subs = new Subscription()
    const isLoading = ref(false)
    const updatedPassword: Ref<boolean> = ref(false)

    onUnmounted(() => subs.unsubscribe())

    const radix = await radixConnection()
    radix.__withWallet(store.state.wallet)

    const handleResetPassword = (newPassword: string) => {
      const getMnemonicForPassword = radix.revealMnemonic()
        .subscribe((m: MnemomicT) => {
          initWallet(m, newPassword, Network.MAINNET)
            .then(wallet => {
              store.commit('setWallet', wallet)
              resetForm()
              updatedPassword.value = true
            })
            .then(() => getMnemonicForPassword.unsubscribe())
        })

      subs.add(getMnemonicForPassword)
    }

    return {
      errors,
      values,
      meta,
      setErrors,
      handleResetPassword,
      isLoading,
      updatedPassword
    }
  },

  computed: {
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    handleSubmit () {
      this.isLoading = true
      touchKeystore()
        .then((keystore: KeystoreT) =>
          Keystore.decrypt({
            keystore,
            password: this.values.currentPassword
          })
        )
        .then((res: Result<Buffer, Error>) => {
          if (res.isOk()) {
            this.handleResetPassword(this.values.password)
          } else {
            this.isLoading = false
            this.setErrors({
              currentPassword: this.$t('validations.incorrectPassword')
            })
          }
        })
        .catch(() => {
          this.isLoading = false
          this.setErrors({
            currentPassword: this.$t('validations.incorrectPassword')
          })
        })
    }
  },

  emits: ['submit']
})

export default SettingsResetPassword
</script>
