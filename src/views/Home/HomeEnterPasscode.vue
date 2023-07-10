<template>
  <div data-ci="create-wallet-create-passcode-component">
    <p class="text-rBlack text-base text-center mb-10">{{ $t('home.passwordTitle') }}</p>
    <form @submit.prevent="handleSubmit" class="flex flex-col w-96 relative">
      <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 opacity transition-opacity" :class="{'opacity-40': disableSubmit}">
        <path d="M3.98975 12.1227V8.91388C3.98975 4.54318 7.55907 1 11.962 1C16.3649 1 19.9342 4.54318 19.9342 8.91388V12.1227" stroke="#00C389" stroke-width="1.5" stroke-miterlimit="10"/>
        <path d="M1 30.3952V11.8662H4.23024H19.7567H22.9869V29.4213H5.57166" stroke="#052CC0" stroke-width="1.5" stroke-miterlimit="10"/>
      </svg>
      <div class="mb-6 flex flex-col">
        <PasswordField
          name="password"
          class="pl-8"
          :placeholder="$t('home.passwordPlaceholder')"
          rules="required"
          data-ci="create-wallet-passcode-input"
          id="password"
          :validateOnInput="true"
          :validateOnBlur="false"
        />
        <FormErrorMessage name="password" class="text-sm text-red-400" />
      </div>

      <ButtonSubmit class="w-96" :disabled="disableSubmit">
        <span v-if="isAuthenticating">
          {{ $t('home.authenticating') }}
        </span>
        <span v-else>
          {{ $t('home.passwordButton') }}
        </span>
      </ButtonSubmit>
    </form>
    <div>
      <button @click.prevent="forgotPassword" role="button" type="button" class="w-96 text-rGrayMed text-sm text-center py-4 block cursor-pointer focus:ring-0">{{ $t('home.forgotPassword')}}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef, Ref } from 'vue'
import { useForm } from 'vee-validate'
import PasswordField from '@/components/PasswordField.vue'
import FormErrorMessage from '@/components/FormErrorMessage.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useI18n } from 'vue-i18n'
import { ref } from '@nopr3d/vue-next-rx'
import { useRouter } from 'vue-router'
import { useOfflineWallet, useSettingsTab, useWallet, useErrors } from '@/composables'
import { firstValueFrom, throwError } from 'rxjs'
import { timeout } from 'rxjs/operators'

interface PasswordForm {
  password: string;
}

const HomeEnterPasscode = defineComponent({
  components: {
    ButtonSubmit,
    PasswordField,
    FormErrorMessage
  },

  setup (props) {
    const isAuthenticating : Ref<boolean> = ref(false)
    const { errors, values, meta, setErrors } = useForm<PasswordForm>()
    const { t } = useI18n({ useScope: 'global' })
    const router = useRouter()
    const { radix, setConnected, setNetwork, loginWithWallet, walletLoaded, nodeUrl } = useWallet(router)
    const { setTab } = useSettingsTab()
    const { setError } = useErrors(radix)
    const { login: loginOffline } = useOfflineWallet()

    const disableSubmit: ComputedRef<boolean> = computed(() => {
      const metaIsDirty = meta.value.dirty ? !meta.value.valid : true
      return isAuthenticating.value || metaIsDirty
    })

    const handleSubmit = async () => {
      isAuthenticating.value = true

      try {
        const client = await loginWithWallet(values.password)
        await loginOffline(values.password)
        const sub = client.ledger.networkId().pipe(
          timeout({
            each: 9000,
            with: () => throwError(() => new Error('network timeout'))
          })
        )
        const network = await firstValueFrom(sub)
        setNetwork(network)
        walletLoaded()
        isAuthenticating.value = false
      } catch (error: any) {
        isAuthenticating.value = false
        setConnected(false)
        if (error.message === 'network timeout') {
          setTab('nodes')
          router.push('/settings')
        } else if (error.cause === 'NETWORK_ID_FAILED') {
          setError(new Error(t('errors.gatewayError', { url: nodeUrl.value })))
          setTab('nodes')
          router.push('/settings')
        }
        setErrors({
          password: t('validations.incorrectPassword')
        })
      }
    }

    return {
      disableSubmit,
      errors,
      handleSubmit,
      isAuthenticating,
      meta,
      props,
      setErrors,
      values
    }
  },

  mounted () {
    const passEl = document.querySelector<HTMLInputElement>('input[type=\'password\']')
    if (passEl) passEl.focus()
  },

  emits: ['forgotPassword'],

  methods: {
    forgotPassword () {
      this.$emit('forgotPassword')
    }
  }
})

export default HomeEnterPasscode
</script>
