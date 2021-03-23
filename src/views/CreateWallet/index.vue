<template>
  <div data-ci="create-wallet-view">
    <router-link to="/" class="mb-4">
      <img alt="Vue logo" src="../../assets/logo.png" class="w-24">
    </router-link>

    <h1 class="mb-4">Create Wallet</h1>

    <create-wallet-view-mnemonic
      v-if="step == 2"
      :mnemonic="mnemonic.words"
      @confirm="step = 1"
    >
    </create-wallet-view-mnemonic>

    <create-wallet-enter-mnemonic
      v-if="step == 1"
      :mnemonic="mnemonic.words"
      @confirm="step = 2"
      @back="step = 0"
    >
    </create-wallet-enter-mnemonic>

    <create-wallet-create-passcode
      v-if="step == 0"
      @confirm="createWallet"
      @back="step = 1"
    >
    </create-wallet-create-passcode>

    <create-wallet-create-pin
      v-if="step == 3"
      @confirm="step = 4"
      @back="step = 2"
    >
    </create-wallet-create-pin>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Mnemonic, MnemomicT, WalletT } from '@radixdlt/account'
import { useTask } from 'vue-concurrency'
import CreateWalletCreatePasscode from './CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from './CreateWalletCreatePin.vue'
import CreateWalletViewMnemonic from './CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from './CreateWalletEnterMnemonic.vue'
import { createWalletFromMnemonicAndPasscode, decryptWallet } from '@/actions/vue/create-wallet'
import { AbortSignalWithPromise } from 'vue-concurrency/dist/vue3/src/types'

const CreateWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    CreateWalletViewMnemonic,
    CreateWalletEnterMnemonic
  },

  setup () {
    const mnemonic: MnemomicT = Mnemonic.generateNew()
    const createWalletTask = useTask(function * (signal: AbortSignalWithPromise, passcode: string) {
      yield createWalletFromMnemonicAndPasscode(mnemonic, passcode)
      const wallet = yield decryptWallet(passcode)
      return wallet
    })

    return { mnemonic, createWalletTask }
  },

  data () {
    return {
      step: 0
    }
  },

  methods: {
    createWallet (passcode: string) {
      this.createWalletTask.perform(passcode)
        .then((wallet: WalletT) => {
          // We have access to the wallet here
          console.log('wallet res', wallet)
          this.step = 3
        })
    }
  }
})

export default CreateWallet
</script>
