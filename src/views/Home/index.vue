<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen" :class="{'items-center': hasWallet.value}">
    <template v-if="!hasWallet.value">
      <div class="w-72 mx-5 py-8">
        <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
        <p class="text-white font-normal text-normal leading-snug mr-12">
          {{ $t('home.welcomeOne') }}
          <br/><br/>
          {{ $t('home.welcomeTwo') }}
          <br/><br/>
          {{ $t('home.welcomeThree') }}
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
          @submit="loginWithWallet"
        ></home-enter-passcode>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { Radix, mockedAPI } from '@radixdlt/application'
import { WalletT } from '@radixdlt/account'
import { hasKeystore, touchKeystore } from '@/actions/vue/create-wallet'
import { useStore } from '@/store'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { Subscription } from 'rxjs'
import { useRouter } from 'vue-router'

const CreateWallet = defineComponent({
  components: {
    HomeCreateAndRestore,
    HomeEnterPasscode,
    LoadingIcon
  },

  setup () {
    const hasWallet = reactive({ value: null as boolean | null })
    const store = useStore()
    const router = useRouter()
    const radix = Radix
      .create()
      .connect('https://54.73.253.49/rpc')
    const subs = new Subscription()

    // Move user to wallet when a wallet is successfully retrieved
    radix.__wallet.subscribe((wallet: WalletT) => {
      store.commit('setWallet', wallet)
      router.push('/wallet')
    }).add(subs)

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
      loginWithWallet
    }
  }
})

export default CreateWallet
</script>
