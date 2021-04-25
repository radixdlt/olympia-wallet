<template>
  <div class="p-10">
    <div class="text-rGrayDark text-sm mb-11 w-full max-w-md">
      {{ $t('settings.mnemonicDisclaimer') }}
      <br /><br />
      <span class="font-bold"> {{ $t('settings.mnemonicDisclaimerTwo') }} </span>
      {{ $t('settings.mnemonicDisclaimerThree') }}
    </div>

    <div class="flex flex-row flex-wrap relative">
      <div
        v-for="(word, i) in displayMnemonic"
        :key="i"
        class="w-1/4 mb-14"
      >
        <mnemonic-display
          :word="word"
          :obfuscate="!this.mnemonic"
        >
        </mnemonic-display>
      </div>

      <ButtonSubmit
        v-if="mnemonicNotRequested"
        :disabled="false"
        @click="enteringPin = true"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {{ $t('settings.accessMnemonicButton') }}
      </ButtonSubmit>

      <template v-if="enteringPin">
        <div
          class="fixed inset-0 w-full h-full flex items-center justify-center"
          @click="enteringPin = false"
        >
        </div>
        <form
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-rGray rounded-md flex flex-col items-center px-11 pt-9 pb-7"
          @submit.prevent="handleSubmit"
        >
          <div class="text-rGrayDark mb-9">{{ $t('settings.mnemonicModalHeading') }}</div>
          <pin-input
            name="pin"
            :values="values.pin"
            :autofocus="true"
            class="mb-9 mx-auto"
            data-ci="validate-pin"
            @finished="handleValidatePin"
          >
          </pin-input>
          <ButtonSubmit
            :disabled="disableSubmit"
            class="mb-9"
          >
            {{ $t('settings.accessMnemonicButton') }}
          </ButtonSubmit>
        </form>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { MnemomicT } from '@radixdlt/account'
import { defineComponent, PropType } from 'vue'
import { useForm } from 'vee-validate'
import MnemonicDisplay from '@/components/MnemonicDisplay.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import PinInput from '@/components/PinInput.vue'
import { validatePin } from '@/actions/vue/create-wallet'

interface RevealMnemonicForm {
  pin: string;
}

const SettingsRevealMnemonic = defineComponent({
  components: {
    ButtonSubmit,
    MnemonicDisplay,
    PinInput
  },

  setup () {
    const { errors, meta, values, setErrors } = useForm<RevealMnemonicForm>()

    return { errors, meta, values, setErrors }
  },

  props: {
    mnemonic: {
      type: Object as PropType<MnemomicT> | null,
      required: false
    }
  },

  data () {
    return {
      enteringPin: false
    }
  },

  computed: {
    displayMnemonic (): string[] {
      return this.mnemonic ? this.mnemonic.words : Array(12).fill('noop')
    },
    mnemonicNotRequested (): boolean {
      return !this.mnemonic && !this.enteringPin
    },
    disableSubmit (): boolean {
      return this.meta.dirty ? !this.meta.valid : true
    }
  },

  methods: {
    handleValidatePin () {
      validatePin(this.values.pin)
        .then((isValid: boolean) => {
          if (!isValid) {
            this.setErrors({
              pin: this.$t('validations.invalidPin')
            })
          }
        })
    },
    handleSubmit () {
      this.$emit('clickAccessMnemonic')
      this.enteringPin = false
    }
  },

  emits: ['clickAccessMnemonic']
})

export default SettingsRevealMnemonic
</script>
