<template>
  <form class="p-10 flex flex-col max-w-lg w-full" @submit.prevent="handleSubmit">
    <div class="text-rGrayDark text-sm mb-11 w-full max-w-md">
      {{ $t('settings.resetPasswordDisclaimer') }}
      <br /><br />
      {{ $t('settings.resetPasswordInstructions') }}
    </div>

    <div class="mb-14">
      <FormField
        type="password"
        name="currentPassword"
        class="w-full"
        :placeholder="$t('settings.currentPasswordLabel')"
        rules="required"
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

    <div class="mb-14">
      <FormField
        type="password"
        name="Passwords"
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
  </form>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { useForm } from 'vee-validate'
import { Radix, mockedAPI, Keystore, KeystoreT, MnemomicT, NetworkT, WalletT } from '@radixdlt/application'
import { Result } from 'neverthrow'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { useStore } from '@/store'
import { touchKeystore, initWallet } from '@/actions/vue/create-wallet'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import FormField from '@/components/FormField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

interface PasswordForm {
  currentPassword: string;
  password: string;
  confirm: string;
}

const SettingsResetPassword = defineComponent({
  components: {
    ButtonSubmit,
    FormField,
    FormErrorMessage
  },

  setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<PasswordForm>()
    const store = useStore()
    const subs = new Subscription()
    const isLoading = ref(false)

    const radix = Radix
      .create()
      .__withAPI(mockedAPI)
      .withWallet(store.state.wallet)

    const handleResetPassword = (newPassword: string) => {
      const getMnemonicForPassword = radix.revealMnemonic()
        .subscribe((m: MnemomicT) => {
          initWallet(m, newPassword, NetworkT.BETANET) // Temporarily hardcoded for betanet
            .then(wallet => {
              store.commit('setWallet', wallet)
              resetForm()
            })
            .then(() => getMnemonicForPassword.unsubscribe())
        })

      subs.add(getMnemonicForPassword)
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      errors,
      values,
      meta,
      setErrors,
      handleResetPassword,
      isLoading
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
          if (res.isOk()) this.handleResetPassword(this.values.password)
          else {
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
