<template>
  <div data-ci="create-wallet-view" class="flex flex-row h-screen">
    <div class="w-72 mr-5 py-8 px-5 text-white leading-snug">
      <router-link to="/" class="flex">
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
      <div class="border border-white rounded p-3 mb-8" v-if="step === 2 && !pinIsSet">{{ $t('restoreWallet.pinHelpOne') }}</div>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 3 && !pinIsSet">{{ $t('restoreWallet.pinHelpTwo') }}</div>
      <div class="border border-white rounded p-3 mb-8" v-if="step === 3 && pinIsSet">Please confirm you understand the disclaimer</div>

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
    <div class="bg-white pb-8" v-if="pinIsSet">
      <multiple-accounts-disclaimer v-if="pinIsSet" @understood="completeWalletRestore"/>
    </div>
    <div v-else  class="bg-white pt-headerHeight pb-8 px-11 flex-1 overflow-y-scroll" >
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
        v-if="step == 2 || step == 3 && !pinIsSet"
        @confirm="handleCreatePin"
        @enteredPin="handleEnterPin"
      >
      </create-wallet-create-pin>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import { MnemomicT, Mnemonic, Network, WalletT } from '@radixdlt/application'
import WizardHeading from '@/components/WizardHeading.vue'
import { initWallet, storePin } from '@/actions/vue/create-wallet'
import RestoreWalletEnterMnemonic from './RestoreWalletEnterMnemonic.vue'
import CreateWalletCreatePasscode from '@/views/CreateWallet/CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from '@/views/CreateWallet/CreateWalletCreatePin.vue'
import MultipleAccountsDisclaimer from '@/views/CreateWallet/MultipleAccountsDisclaimer.vue'
import { ref as rxRef } from '@nopr3d/vue-next-rx'
import { saveDerivedAccountsIndex } from '@/actions/vue/data-store'
import { useSidebar, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { firstValueFrom } from 'rxjs'

const RestoreWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    MultipleAccountsDisclaimer,
    RestoreWalletEnterMnemonic,
    WizardHeading
  },

  setup () {
    const step = rxRef(0)
    const passcode: Ref<string> = rxRef('')
    const mnemonic: Ref<MnemomicT | null> = rxRef(null)
    const router = useRouter()
    const { loginWithWallet, setNetwork, walletLoaded, setWallet, waitUntilAllLoaded } = useWallet(router)
    const { setState } = useSidebar()
    const newWallet: Ref<WalletT | null> = ref(null)
    const pinIsSet: Ref<boolean> = ref(false)

    // Create wallet with password and path to keystore
    const createWallet = (pass: string) => {
      if (!mnemonic.value) return
      initWallet(mnemonic.value, pass, Network.MAINNET)
        .then((wallet: WalletT) => {
          saveDerivedAccountsIndex(0, Network.MAINNET)
          step.value = 2
          passcode.value = pass
          newWallet.value = wallet
        })
    }

    const captureMnemonic = (mnemonicVal: MnemomicT) => {
      mnemonic.value = mnemonicVal
      step.value = 1
    }

    const handleEnterPin = (val: boolean) => {
      val ? step.value = 3 : step.value = 2
    }

    const handleCreatePin = (pin: string) => {
      pinIsSet.value = true
      if (!newWallet.value) return
      setWallet(newWallet.value)
      storePin(pin)
    }

    const completeWalletRestore = (isUnderstood: boolean) => {
      if (isUnderstood) {
        loginWithWallet(passcode.value).then((client) => {
          return firstValueFrom(client.ledger.networkId())
        }).then((network) => {
          setNetwork(network)
          walletLoaded()
          return waitUntilAllLoaded()
        }).then(() => {
          setState(true)
          router.push('/wallet/account-edit-name')
        })
      }
    }

    return {
      // state
      mnemonic,
      step,
      passcode,
      pinIsSet,
      // methods
      createWallet,
      captureMnemonic,
      completeWalletRestore,
      handleEnterPin,
      handleCreatePin
    }
  }
})

export default RestoreWallet
</script>
