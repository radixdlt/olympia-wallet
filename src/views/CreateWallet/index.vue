<template>
  <div data-ci="create-wallet-view" class="flex flex-row min-h-screen">
    <div class="w-72 mr-5 py-8 px-5 text-white leading-snug">
      <router-link to="/">
        <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-12 ">
      </router-link>
      <wizard-heading
        :name="$t('createWallet.recoveryTitle')"
        :isActiveStep="step === 0 || step === 1"
        :isCompleted="step > 1"
        @click="step = 0"
      >
      </wizard-heading>
      <div v-if="step === 0">
        <div class="border border-white rounded p-3 mb-8">{{ $t('createWallet.recoveryHelpOne') }}</div>
      </div>
      <div v-if="step === 1">
        <div class="border border-white rounded p-3 mb-8">{{ $t('createWallet.recoveryHelpTwo') }}</div>
      </div>

      <wizard-heading
        :name="$t('createWallet.passwordTitle')"
        :isActiveStep="step === 2"
        :isCompleted="step > 2"
        :disabled="step < 2"
        @click="step = 2"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 2">{{ $t('createWallet.passwordHelp') }}</div>

      <wizard-heading
        :name="$t('createWallet.pinTitle')"
        :isActiveStep="step === 3"
        :isCompleted="step > 3"
        :disabled="step < 3"
        @click="() => {
          step = 3
          resetPinTrigger = resetPinTrigger + 1
        }"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 3">{{ $t('createWallet.pinHelpOne') }}</div>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 4">{{ $t('createWallet.pinHelpTwo') }}</div>
    </div>

    <div class="bg-white pt-headerHeight pb-8 px-11 flex-1">
      <create-wallet-view-mnemonic
        v-if="step == 0"
        :mnemonic="mnemonic.words"
        @confirm="step = 1"
      >
      </create-wallet-view-mnemonic>

      <create-wallet-enter-mnemonic
        v-if="step == 1"
        :mnemonic="mnemonic.words"
        @confirm="step = 2"
      >
      </create-wallet-enter-mnemonic>

      <create-wallet-create-passcode
        v-if="step == 2"
        @confirm="createWallet"
      >
      </create-wallet-create-passcode>

      <create-wallet-create-pin
        v-if="step == 3 || step == 4"
        @confirm="() => console.log('completed')"
        @enteredPin="handleEnterPin"
      >
      </create-wallet-create-pin>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Mnemonic, MnemomicT, WalletT } from '@radixdlt/account'
import { useTask } from 'vue-concurrency'
import { AbortSignalWithPromise } from 'vue-concurrency/dist/vue3/src/types'
import CreateWalletCreatePasscode from './CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from './CreateWalletCreatePin.vue'
import CreateWalletViewMnemonic from './CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from './CreateWalletEnterMnemonic.vue'
import WizardHeading from '@/components/WizardHeading.vue'
import { createWalletFromMnemonicAndPasscode, decryptWallet } from '@/actions/vue/create-wallet'

const CreateWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    CreateWalletViewMnemonic,
    CreateWalletEnterMnemonic,
    WizardHeading
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
    },
    handleEnterPin (val: boolean) {
      val ? this.step = 4 : this.step = 3
    }
  }
})

export default CreateWallet
</script>
