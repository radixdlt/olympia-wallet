<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen" :class="{'items-center': hasWallet.value}">
    <template v-if="!hasWallet.value">
      <div class="w-72 mx-5 py-8">
        <div class="flex">
          <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-8">
        </div>
        <div class="text-white font-normal text-normal leading-snug mr-12">
          <div class="text-lg"> {{ $t('home.welcomeOne') }} </div>
          <div class="text-sm mt-3"> {{ $t('home.welcomeFour') }} </div>
          <div class="text-sm mt-3"> {{ $t('home.welcomeFive') }} </div>
        </div>
      </div>
      <div class="py-8 flex flex-row">
        <home-create-and-restore/>
      </div>
    </template>

    <template v-else>
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="absolute inset-0 mt-6 mx-4">
      <div v-if="hasWallet.value == null" class="flex w-full justify-center items-center">
        <loading-icon/>
      </div>

      <div
        v-if="hasWallet.value == true"
        class="bg-white pt-8 pb-4 px-11 max-w-lg rounded mx-auto"
      >
        <home-enter-passcode
          @submit="loginWithWallet"
          @forgotPassword="forgotPassword"
          ref="enterPasscodeComponent"
        />
      </div>
      <home-locked-modal :open="modal === 'locked-out'" @close="closeModal"/>
      <home-forgot-password
        :open="modal === 'forgot-password'"
        @close="closeModal"
        @resetAndCreate="resetAndCreate"
        @resetAndRestore="resetAndRestore"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { Radix, WalletErrorCause, WalletT, Network } from '@radixdlt/application'
import { hasKeystore, touchKeystore } from '@/actions/vue/create-wallet'
import { useStore } from '@/store'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import HomeLockedModal from './HomeLockedModal.vue'
import HomeForgotPassword from './HomeForgotPassword.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { Subscription } from 'rxjs'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from '@nopr3d/vue-next-rx'
import { filter } from 'rxjs/operators'
import { resetStore } from '@/actions/vue/data-store'
import { radixConnection, setNetwork } from '@/helpers/network'

const CreateWallet = defineComponent({
  components: {
    HomeCreateAndRestore,
    HomeEnterPasscode,
    HomeLockedModal,
    HomeForgotPassword,
    LoadingIcon
  },

  props: {
    modal: {
      type: String,
      required: false
    }
  },

  async setup () {
    const hasWallet = reactive({ value: null as boolean | null })
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n({ useScope: 'global' })

    const enterPasscodeComponent = ref(null)

    let radix = await radixConnection()
    radix = await setNetwork(radix, process.env.VUE_APP_NETWORK_NAME as Network)
    const subs = new Subscription()

    radix.errors
      .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
      .subscribe(
        () => {
          enterPasscodeComponent.value.setErrors({
            password: t('validations.incorrectPassword')
          })
        }
      )

    // Move user to wallet when a wallet is successfully retrieved
    subs.add(radix.__wallet.subscribe((wallet: WalletT) => {
      store.commit('setWallet', wallet)
      router.push('/wallet')
    }))

    // Login with password and path to keystore
    const loginWithWallet = (password: string) => {
      radix.login(password, touchKeystore)
    }

    // Check if keystore exists
    hasKeystore().then((res: boolean) => { hasWallet.value = res })

    return {
      // state
      hasWallet,
      // methods
      loginWithWallet,
      // component refs
      enterPasscodeComponent,
      closeModal () {
        router.push({ name: 'Home', query: { modal: '' } })
      },

      forgotPassword () {
        router.push({ name: 'Home', query: { modal: 'forgot-password' } })
      },

      resetAndCreate () {
        resetStore()
        hasWallet.value = false
        router.push('/create-wallet')
      },

      resetAndRestore () {
        resetStore()
        hasWallet.value = false
        router.push('/restore-wallet')
      }
    }
  }
})

export default CreateWallet
</script>
