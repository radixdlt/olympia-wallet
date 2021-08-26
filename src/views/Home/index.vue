<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen" :class="{'items-center': hasWallet}">
    <template v-if="hasWallet">
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="absolute inset-0 mt-6 mx-4">
      <div v-if="hasWallet == null" class="flex w-full justify-center items-center">
        <loading-icon/>
      </div>

      <div
        v-if="hasWallet == true"
        class="bg-white pt-8 pb-4 px-11 max-w-lg rounded mx-auto"
      >
        <home-enter-passcode
          @submit="loginWithWallet"
          @forgotPassword="forgotPassword"
          ref="enterPasscodeComponent"
        />
      </div>
      <home-locked-modal :open="uiModal === 'locked-out'" @close="closeModal"/>
      <home-forgot-password
        :open="uiModal === 'forgot-password'"
        @close="closeModal"
        @resetAndCreate="resetAndCreate"
        @resetAndRestore="resetAndRestore"
      />
    </template>

    <template v-else>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onBeforeMount, ref } from 'vue'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import HomeLockedModal from './HomeLockedModal.vue'
import HomeForgotPassword from './HomeForgotPassword.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref as rxRef } from '@nopr3d/vue-next-rx'
import useRadix from '@/composables/useRadix'
import useWallet, { WalletError } from '@/composables/useWallet'

const Home = defineComponent({
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

  setup (props) {
    const uiModal = ref('')

    onBeforeMount(() => {
      if (props.modal) { uiModal.value = props.modal }
    })

    const router = useRouter()
    const { radix } = useRadix()
    const { hasWallet, invalidPasswordError, loginWithWallet, resetWallet, walletLoaded } = useWallet(radix, router)
    const { t } = useI18n({ useScope: 'global' })

    const enterPasscodeComponent = rxRef(null)

    walletLoaded()

    watch(
      () => invalidPasswordError.value,
      (value: WalletError | null) => {
        if (value) {
          enterPasscodeComponent.value.setErrors({
            password: t('validations.incorrectPassword')
          })
        }
      }
    )

    return {
      hasWallet,
      uiModal,
      // methods
      loginWithWallet,
      enterPasscodeComponent,

      closeModal () {
        uiModal.value = ''
      },

      forgotPassword () {
        uiModal.value = 'forgot-password'
      },

      resetAndCreate () {
        resetWallet('create-wallet')
      },

      resetAndRestore () {
        resetWallet('restore-wallet')
      }
    }
  }
})

export default Home
</script>
