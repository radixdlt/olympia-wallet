<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen items-center">
    <template v-if="hasWallet == false">
      <div class="w-72 mx-5 py-8">
        <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
        <p class="text-white font-normal text-normal leading-snug mr-12">
          Welcome to the Radix Betanet.
          <br/><br/>
          Decentralized finance applications are currently being built on protocols that were not designed to meet the needs and requirements of DeFi services.
          <br/><br/>
          Radix is using our significant technology innovations to be the first layer 1 protocol specifically built to serve the rapidly growing DeFi industry.
        </p>
      </div>
      <div class="py-8 flex flex-row">
        <home-create-and-restore></home-create-and-restore>
      </div>
    </template>

    <template v-else>
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="absolute inset-0 mt-6 mx-4">
      <div v-if="hasWallet.value == null" class="flex w-full justify-center items-center">
        <loading-icon></loading-icon>
      </div>

      <div
        v-if="hasWallet.value == true"
        class="bg-white py-8 px-11 max-w-lg rounded mx-auto"
      >
        <home-enter-passcode
          @submit="createWallet"
        ></home-enter-passcode>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { WalletT } from '@radixdlt/account'
import { ref } from '@nopr3d/vue-next-rx'
import { useTask } from 'vue-concurrency'
import { AbortSignalWithPromise } from 'vue-concurrency/dist/vue3/src/types'
import { decryptWallet, touchKeystore } from '@/actions/vue/create-wallet'
import { useStore } from '@/store'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'

const CreateWallet = defineComponent({
  components: {
    HomeCreateAndRestore,
    HomeEnterPasscode,
    LoadingIcon
  },

  setup () {
    /* This is a demo to prove we can integrate with the SDK to fetch a wallet's accounts */
    const activeAccount = ref(null)
    const accounts = ref(null)
    const hasWallet = reactive({ value: null as boolean | null })
    const store = useStore()

    const createWalletTask = useTask(function * (signal: AbortSignalWithPromise, passcode: string) {
      const wallet = yield decryptWallet(passcode)
      return wallet
    })
    const touchKeystoreTask = useTask(function * () {
      return touchKeystore()
    })

    // Check if local keystore exists
    touchKeystoreTask.perform()
      .then((json: string) => {
        JSON.parse(json)
        hasWallet.value = true
      })
      .catch(() => {
        hasWallet.value = false
        console.log('keystore doesn\'t exist')
      })

    return {
      // tasks
      createWalletTask,
      // state
      accounts,
      activeAccount,
      hasWallet,
      // mutations
      setWallet: (wallet: WalletT) => store.commit('setWallet', wallet)
    }
  },

  methods: {
    createWallet (passcode: string) {
      this.createWalletTask.perform(passcode)
        .then((wallet: WalletT) => {
          this.hasWallet.value = true
          this.setWallet(wallet)
          this.$router.push('/wallet')
        })
    }
  }
})

export default CreateWallet
</script>
