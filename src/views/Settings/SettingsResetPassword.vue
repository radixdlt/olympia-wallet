<template>
  <form class="p-6 flex flex-col max-w-lg w-full" @submit.prevent="handleSubmit">
    <div class="text-rGrayDark text-sm mb-8 w-full max-w-lg">
      {{ $t('settings.resetPasswordDisclaimer') }}
      <br /><br />
      {{ $t('settings.resetPasswordInstructions') }}
    </div>

    <div class="mb-14">
      <PasswordField
        name="currentPassword"
        :placeholder="$t('settings.currentPasswordPlaceholder')"
        rules="required"
        :label="$t('settings.currentPasswordLabel')"
        data-ci="create-wallet-passcode-input"
        :validateOnInput="true"
      />
      <FormErrorMessage name="currentPassword" />
    </div>

    <div class="mb-14">
      <PasswordField
        name="password"
        :placeholder="$t('settings.newPasswordLabel')"
        rules="required"
        data-ci="create-wallet-passcode-input"
        :validateOnInput="true"
      />
      <FormErrorMessage name="password" />
    </div>

    <div class="mb-8">
      <PasswordField
        name="confirmation"
        :placeholder="$t('settings.confirmPasswordLabel')"
        rules="required|confirmed:@password"
        data-ci="create-wallet-confirm-input"
        :validateOnInput="true"
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
import { computed, ComputedRef, defineComponent, onUnmounted, Ref } from 'vue'
import { useForm } from 'vee-validate'
import { Keystore, KeystoreT, MnemomicT, Network } from '@radixdlt/application'
import { Result } from 'neverthrow'
import { Subscription } from 'rxjs'
import { ref } from '@nopr3d/vue-next-rx'
import { touchKeystore, initWallet } from '@/actions/vue/create-wallet'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import PasswordField from '@/components/PasswordField.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import { useI18n } from 'vue-i18n'

interface PasswordForm {
  currentPassword: string;
  password: string;
  confirmation: string;
}

const SettingsResetPassword = defineComponent({
  components: {
    ButtonSubmit,
    FormErrorMessage,
    PasswordField
  },

  setup () {
    const { errors, values, meta, setErrors, resetForm } = useForm<PasswordForm>()
    const { t } = useI18n({ useScope: 'global' })
    const subs = new Subscription()
    const router = useRouter()
    const { radix } = useWallet(router)

    const isLoading = ref(false)
    const updatedPassword: Ref<boolean> = ref(false)

    const disableSubmit: ComputedRef<boolean> = computed(() => meta.value.dirty ? !meta.value.valid : true)

    const handleResetPassword = (newPassword: string) => {
      const getMnemonicForPassword = radix.revealMnemonic()
        .subscribe((m: MnemomicT) => {
          initWallet(m, newPassword, Network.MAINNET)
            .then(() => {
              resetForm()
              updatedPassword.value = true
            })
            .then(() => getMnemonicForPassword.unsubscribe())
        })

      subs.add(getMnemonicForPassword)
    }

    const handleSubmit = async () => {
      isLoading.value = true
      try {
        const keystore = await touchKeystore()
        const decryptedResult = await Keystore.decrypt({ keystore, password: values.password })
        if (decryptedResult.isOk()) {
          handleResetPassword(values.password)
        } else {
          isLoading.value = false
          setErrors({
            currentPassword: t('validations.incorrectPassword')
          })
        }
      } catch {
        isLoading.value = false
        setErrors({
          currentPassword: t('validations.incorrectPassword')
        })
      }
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      errors,
      values,
      meta,
      setErrors,
      isLoading,
      updatedPassword,
      disableSubmit,
      handleResetPassword,
      handleSubmit
    }
  }
})

export default SettingsResetPassword
</script>
