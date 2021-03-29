<template>
  <div data-ci="create-wallet-view" class="flex flex-row min-h-screen">
    <div class="w-72 mr-5 py-8 px-5 text-white leading-snug">
      <router-link to="/">
        <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-12 ">
      </router-link>
      <wizard-heading
        name="Recovery Phrase"
        :isActiveStep="step === 0"
        :isCompleted="step > 1"
        @click="step = 0"
      >
      </wizard-heading>
      <div v-if="step === 0">
        <div class="border border-white rounded p-3 mb-8">
          Enter your 12 word mnemonic to restore your wallet.
        </div>
      </div>

      <wizard-heading
        name="Password"
        :isActiveStep="step === 1"
        :isCompleted="step > 1"
        :disabled="step < 1"
        @click="step = 1"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 1">
        Please enter a secure password here. This password secures your mnemonicly generated key, and will be required every time you open this application
      </div>

      <wizard-heading
        name="PIN"
        :isActiveStep="step === 2"
        :isCompleted="step > 2"
        :disabled="step < 2"
        @click="() => {
          step = 2
          resetPinTrigger = resetPinTrigger + 1
        }"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 2">
        Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.
      </div>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 3">
        Please confirm your PIN.
      </div>
    </div>

    <div class="bg-white pt-headerHeight pb-8 px-11 flex-1">
      <restore-wallet-enter-mnemonic
        v-if="step == 0"
        @confirm="captureMnemonic"
      >
      </restore-wallet-enter-mnemonic>

      <create-wallet-create-passcode
        v-if="step == 1"
        @confirm="createWallet"
      >
      </create-wallet-create-passcode>

      <create-wallet-create-pin
        v-if="step == 2 || step == 3"
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
import WizardHeading from '@/components/WizardHeading.vue'
import { createWalletFromMnemonicAndPasscode, decryptWallet } from '@/actions/vue/create-wallet'
import RestoreWalletEnterMnemonic from './RestoreWalletEnterMnemonic.vue'
import CreateWalletCreatePasscode from '@/views/CreateWallet/CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from '@/views/CreateWallet/CreateWalletCreatePin.vue'

const RestoreWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    RestoreWalletEnterMnemonic,
    WizardHeading
  },

  data () {
    return {
      step: 0,
      mnemonic: null as MnemomicT | null
    }
  },

  methods: {
    captureMnemonic (mnemonic: string[]) {
      const mnemonicRes = Mnemonic.fromEnglishWords(mnemonic)
      if (mnemonicRes.isErr()) {
        console.warn('error, invalid mnemonic!')
      } else {
        this.mnemonic = mnemonicRes.value
        this.step = 1
      }
    },
    createWallet (passcode: string) {
      const createWalletTask = useTask(function * (signal: AbortSignalWithPromise, passcode: string, mnemonic: MnemomicT) {
        yield createWalletFromMnemonicAndPasscode(mnemonic, passcode)
        const wallet = yield decryptWallet(passcode)
        return wallet
      })

      if (this.mnemonic) {
        createWalletTask.perform(passcode, this.mnemonic)
          .then((wallet: WalletT) => {
            // We have access to the wallet here
            console.log('wallet res', wallet)
            this.step = 2
          })
      }
    },
    handleEnterPin (val: boolean) {
      val ? this.step = 3 : this.step = 2
    }
  }
})

export default RestoreWallet
</script>
