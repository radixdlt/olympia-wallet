<template>
  <div class="pt-6 px-6 pb-4">
    <div class="text-rGrayDark text-sm mb-11 w-full max-w-lg">
      {{ $t('settings.mnemonicDisclaimer') }}
      <br /><br />
      <span class="font-bold"> {{ $t('settings.mnemonicDisclaimerTwo') }} </span>
      {{ $t('settings.mnemonicDisclaimerThree') }}
    </div>

    <div
      class="grid gap-y-12 relative mb-12"
      :class="{
        'grid-cols-4': mnemonicStrength === StrengthT.WORD_COUNT_12,
        'grid-cols-6': mnemonicStrength != StrengthT.WORD_COUNT_12
      }"
    >
      <mnemonic-display
        v-for="(word, i) in displayMnemonic"
        :key="i"
        :word="word"
        :index="i"
        :obfuscate="!this.mnemonic"
        :isWide="mnemonicStrength === StrengthT.WORD_COUNT_12"
      >
      </mnemonic-display>

      <ButtonSubmit
        v-if="mnemonicNotRequested"
        :disabled="false"
        @click="enteringPassword = true"
        class="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {{ $t('settings.accessMnemonicButton') }}
      </ButtonSubmit>

      <template v-if="enteringPassword">
        <form
          class="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-rGray rounded-md flex flex-col items-center px-11 pt-9 pb-7"
          @submit.prevent="handleSubmit"
        >
          <div class="text-rGrayDark mb-9">{{ $t('settings.mnemonicModalHeading') }}</div>
          <PasswordField
            name="password"
            :placeholder="$t('settings.passwordPlaceholder')"
            rules="required"
            data-ci="create-wallet-passcode-input"
            :validateOnInput="true"
          />
          <FormErrorMessage name="password" />
          <ButtonSubmit
            :disabled="submitDisabled"
            class="mb-2 mt-9"
          >
            {{ $t('settings.accessMnemonicButton') }}
          </ButtonSubmit>

          <button
              class="text-rGrayDark py-4 px-4 text-sm mx-auto"
              @click="() => enteringPassword = false"
            >
              {{ $t('settings.accessMnemonicCancelPin') }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { MnemomicT, Keystore, KeystoreT, StrengthT } from '@radixdlt/application'
import { defineComponent, computed, PropType, ref, Ref, ComputedRef, toRef } from 'vue'
import { useForm } from 'vee-validate'
import MnemonicDisplay from '@/components/MnemonicDisplay.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import PasswordField from '@/components/PasswordField.vue'
import { touchKeystore } from '@/actions/vue/create-wallet'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import { useI18n } from 'vue-i18n'

interface RevealMnemonicForm {
  password: string;
}

const SettingsRevealMnemonic = defineComponent({
  components: {
    ButtonSubmit,
    MnemonicDisplay,
    PasswordField,
    FormErrorMessage
  },

  setup (props, { emit }) {
    const { errors, meta, values, setErrors, resetForm } = useForm<RevealMnemonicForm>()
    const enteringPassword: Ref<boolean> = ref(false)
    const mneumonic = toRef(props, 'mnemonic')
    const { t } = useI18n()
    const handleSubmit = async () => {
      try {
        const keystore: KeystoreT = await touchKeystore()
        const decryptedResult = await Keystore.decrypt({ keystore, password: values.password })
        if (decryptedResult.isOk()) {
          emit('clickAccessMnemonic')
          enteringPassword.value = false
        } else {
          setErrors({ password: t('validations.incorrectPassword') })
        }
      } catch {
        setErrors({ password: t('validations.incorrectPassword') })
      }
    }

    const disableSubmit = computed(() => {
      return meta.value.dirty ? !meta.value.valid : true
    })

    const mnemonicNotRequested = computed(() => {
      return !mneumonic.value && !enteringPassword.value
    })

    const displayMnemonic = computed(() => {
      return mneumonic.value ? mneumonic.value.words : Array(12).fill('noop')
    })

    const mnemonicStrength: ComputedRef<StrengthT> = computed(() =>
      props.mnemonic ? props.mnemonic.strength : StrengthT.WORD_COUNT_12
    )

    const submitDisabled: ComputedRef<boolean> = computed(() =>
      meta.value.dirty ? !meta.value.valid : true
    )

    return {
      displayMnemonic,
      enteringPassword,
      errors,
      meta,
      mnemonicNotRequested,
      mnemonicStrength,
      submitDisabled,
      StrengthT,
      values,

      // methods
      disableSubmit,
      handleSubmit,
      setErrors,
      resetForm
    }
  },

  props: {
    mnemonic: {
      type: Object as PropType<MnemomicT> | null,
      required: false
    }
  },

  emits: ['clickAccessMnemonic', 'cancel']
})

export default SettingsRevealMnemonic
</script>
