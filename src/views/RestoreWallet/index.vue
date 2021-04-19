<template>
  <div data-ci="create-wallet-view" class="flex flex-row min-h-screen">
    <div class="w-72 mr-5 py-8 px-5 text-white leading-snug">
      <router-link to="/">
        <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-12 ">
      </router-link>
      <wizard-heading
        :name="$t('restoreWallet.recoveryTitle')"
        :isActiveStep="step === 0"
        :isCompleted="step > 1"
        @click="step = 0"
      >
      </wizard-heading>
      <div v-if="step === 0">
        <div class="border border-white rounded p-3 mb-8">{{ $t('restoreWallet.recoveryHelp') }}</div>
      </div>

      <wizard-heading
        :name="$t('restoreWallet.passwordTitle')"
        :isActiveStep="step === 1"
        :isCompleted="step > 1"
        :disabled="step < 1"
        @click="step = 1"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 1">{{ $t('restoreWallet.passwordHelp') }}</div>

      <wizard-heading
        :name="$t('restoreWallet.pinTitle')"
        :isActiveStep="step === 2"
        :isCompleted="step > 2"
        :disabled="step < 2"
        @click="() => {
          step = 2
          resetPinTrigger = resetPinTrigger + 1
        }"
      >
      </wizard-heading>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 2">{{ $t('restoreWallet.pinHelpOne') }}</div>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 3">{{ $t('restoreWallet.pinHelpTwo') }}</div>
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
        @confirm="handleCreatePin"
        @enteredPin="handleEnterPin"
      >
      </create-wallet-create-pin>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Mnemonic, WalletT } from '@radixdlt/account'
import WizardHeading from '@/components/WizardHeading.vue'
import { createWalletFromMnemonicAndPasscode, storePin } from '@/actions/vue/create-wallet'
import RestoreWalletEnterMnemonic from './RestoreWalletEnterMnemonic.vue'
import CreateWalletCreatePasscode from '@/views/CreateWallet/CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from '@/views/CreateWallet/CreateWalletCreatePin.vue'
import { useStore } from '@/store'
import { ref } from '@nopr3d/vue-next-rx'

const RestoreWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    RestoreWalletEnterMnemonic,
    WizardHeading
  },

  setup () {
    const store = useStore()
    const step = ref(0)
    const passcode = ref('')
    const mnemonic = ref(null)

    // Create wallet with password and path to keystore
    const createWallet = (pass: string) => {
      createWalletFromMnemonicAndPasscode(mnemonic.value, pass)
        .then((wallet: WalletT) => {
          store.commit('setWallet', wallet)
          step.value = 2
          passcode.value = pass
        })
    }

    return {
      // state
      mnemonic,
      step,
      passcode,
      // methods
      createWallet
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
    handleEnterPin (val: boolean) {
      val ? this.step = 3 : this.step = 2
    },
    handleCreatePin (pin: string) {
      storePin(pin)
      this.$router.push({ path: '/wallet', query: { initialView: 'editName', initialSidebar: 'accounts' } })
    }
  }
})

export default RestoreWallet
</script>
