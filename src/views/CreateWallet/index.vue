<template>
  <div data-ci="create-wallet-view" class="flex flex-row min-h-screen">
    <div class="w-72 mr-5 py-8 px-5 text-white leading-snug">
      <router-link to="/" class="flex">
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

      <router-link
        to="/"
        data-ci="home-button"
        class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center absolute bottom-8"
      >
       <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
          <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current" />
          <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
        </svg>
        {{ $t('createWallet.startOver') }}
      </router-link>
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
        @confirm="handleCreatePin"
        @enteredPin="handleEnterPin"
      >
      </create-wallet-create-pin>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Mnemonic, MnemomicT, Network, WalletT } from '@radixdlt/application'
import CreateWalletCreatePasscode from './CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from './CreateWalletCreatePin.vue'
import CreateWalletViewMnemonic from './CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from './CreateWalletEnterMnemonic.vue'
import WizardHeading from '@/components/WizardHeading.vue'
import { initWallet, storePin } from '@/actions/vue/create-wallet'
import { useStore } from '@/store'
import { ref } from '@nopr3d/vue-next-rx'
import { saveDerivedAccountsIndex } from '@/actions/vue/data-store'

const CreateWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    CreateWalletViewMnemonic,
    CreateWalletEnterMnemonic,
    WizardHeading
  },

  setup () {
    const store = useStore()
    const mnemonic: MnemomicT = Mnemonic.generateNew()
    const step = ref(0)
    const passcode = ref('')

    // Create wallet with password and path to keystore
    const createWallet = (pass: string) => {
      initWallet(mnemonic, pass, Network.STOKENET) // TEMP: Hardcoded for betanet
        .then((wallet: WalletT) => {
          store.commit('setWallet', wallet)
          saveDerivedAccountsIndex(0)
          step.value = 3
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
    handleEnterPin (val: boolean) {
      val ? this.step = 4 : this.step = 3
    },
    handleCreatePin (pin: string) {
      storePin(pin)
      this.$router.push({ path: '/wallet', query: { initialView: 'editName', initialSidebar: 'accounts' } })
    }
  }
})

export default CreateWallet
</script>
