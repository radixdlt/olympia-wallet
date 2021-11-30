<template>
  <div class="pt-6 px-6 pb-4">
    <div class="text-rGrayDark text-sm mb-11 w-full max-w-lg">
      {{ $t('settings.mnemonicDisclaimer') }}
      <br /><br />
      <span class="font-bold"> {{ $t('settings.mnemonicDisclaimerTwo') }} </span>
      {{ $t('settings.mnemonicDisclaimerThree') }}
    </div>

    <div class="flex flex-row flex-wrap relative">
      <div
        v-for="(word, i) in displayMnemonic"
        :key="i"
        class="w-1/4 mb-8"
      >
        <mnemonic-display
          :word="word"
          :index="i"
          :obfuscate="!this.mnemonic"
        >
        </mnemonic-display>
      </div>

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
            :disabled="disableSubmit"
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
import { MnemomicT, Keystore, KeystoreT } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import MnemonicDisplay from '@/components/MnemonicDisplay.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import PasswordField from '@/components/PasswordField.vue'
import { touchKeystore } from '@/actions/vue/create-wallet'
import { Result } from 'neverthrow'
import FormErrorMessage from '@/components/FormErrorMessage.vue'

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

  setup () {
    const { errors, meta, values, setErrors, resetForm } = useForm<RevealMnemonicForm>()

    return { errors, meta, values, setErrors, resetForm }
  },

  props: {
    mnemonic: {
      type: Object as PropType<MnemomicT> | null,
      required: false
    }
  },

  data () {
    return {
      enteringPassword: false
    }
  },

  computed: {
    displayMnemonic (): string[] {
      return this.mnemonic ? this.mnemonic.words : Array(12).fill('noop')
    },
    mnemonicNotRequested (): boolean {
      return !this.mnemonic && !this.enteringPassword
    },
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    handleSubmit () {
      touchKeystore()
        .then((keystore: KeystoreT) =>
          Keystore.decrypt({
            keystore,
            password: this.values.password
          })
        )
        .then((res: Result<Buffer, Error>) => {
          if (res.isOk()) {
            this.$emit('clickAccessMnemonic')
            this.enteringPassword = false
          } else {
            this.setErrors({
              password: this.$t('validations.incorrectPassword')
            })
          }
        })
        .catch(() => {
          this.setErrors({
            password: this.$t('validations.incorrectPassword')
          })
        })
    }
  },

  emits: ['clickAccessMnemonic', 'cancel']
})

export default SettingsRevealMnemonic
</script>
