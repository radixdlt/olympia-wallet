<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen" :class="{'items-center': hasWallet}" v-if="!loading">
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
      <div class="py-8 flex flex-row w-full">
        <div v-if="unableToConnect" class="bg-white rounded py-9 px-11 flex max-w-sm self-start">
          <div class="flex flex-col gap-4">
            <p>
              Sorry, the Radix Desktop Wallet cannot currently connect to the Radix mainnet network.  Please check your
              internet connection, or check our <a class="text-rBlue" href="https://status.radixdlt.com">network status page</a> for known connection issues.
            </p>
            <p>
              If you have further problems, please contact us at <a class="text-rBlue" href="mailto:hello@radixdlt.com">hello@radixdlt.com</a>
            </p>
          </div>
        </div>
        <div v-else-if="!connected" class="bg-white rounded p-11 flex items-center gap-4 justify-center self-start">
          <wallet-loading />
          Connecting...
        </div>
        <home-create-and-restore v-else />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import HomeLockedModal from './HomeLockedModal.vue'
import HomeForgotPassword from './HomeForgotPassword.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { useRouter } from 'vue-router'
import { useHomeModal, useWallet } from '@/composables'
import { firstValueFrom } from 'rxjs'
import { Network } from '@radixdlt/application'
import WalletLoading from '@/views/Wallet/WalletLoading.vue'
import { hasKeystore } from '@/actions/vue/create-wallet'
const Home = defineComponent({
  components: {
    HomeCreateAndRestore,
    HomeEnterPasscode,
    HomeLockedModal,
    HomeForgotPassword,
    LoadingIcon,
    WalletLoading
  },

  setup () {
    const connected: Ref<boolean> = ref(false)
    const unableToConnect = ref(false)
    const loading = ref(true)
    const { modal, setModal } = useHomeModal()
    const router = useRouter()
    const { hasWallet, resetWallet, radix, setNetwork } = useWallet(router)

    hasKeystore().then((val: boolean) => {
      loading.value = false
      console.log('hi', val)
      if (!val) {
        // Promise.race([
        //   radix.connect('https://mainnet.radixdlt.com'),
        //   new Promise((resolve, reject) => setTimeout(() => reject(new Error()), 5000))
        // ]).then(() => {
        radix.connect('https://milestonenet-gateway.radixdlt.com').then(() => {
          console.log('hello')
          connected.value = true
          return firstValueFrom(radix.ledger.networkId())
        }).then((network: Network) => {
          setNetwork(network as Network)
        }).catch(() => {
          console.log('whoops')
          unableToConnect.value = true
          connected.value = false
        })
      }
    })

    return {
      loading,
      hasWallet,
      modal,
      connected,
      unableToConnect,

      closeModal () {
        setModal(null)
      },

      forgotPassword () {
        setModal('forgot-password')
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
