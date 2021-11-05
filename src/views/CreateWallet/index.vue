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
        <div class="border border-white rounded p-3 mb-8">{{ $t('createWallet.recoveryHelpOne', {numWords: mnemonicWordLength}) }}</div>
      </div>
      <div v-if="step === 1">
        <div class="border border-white rounded p-3 mb-8">{{ $t('createWallet.recoveryHelpTwo', {numWords: mnemonicWordLength}) }}</div>
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
        :mnemonicStrength="mnemonicStrength"
        @confirm="step = 1"
        @setSeedStrength="handleSetSeedStrength"
      >
      </create-wallet-view-mnemonic>

      <create-wallet-enter-mnemonic
        v-if="step == 1"
        :mnemonic="mnemonic.words"
        :mnemonicStrength="mnemonicStrength"
        @confirm="step = 2"
      >
      </create-wallet-enter-mnemonic>

      <create-wallet-create-passcode
        v-if="step == 2"
        @confirm="handleCreateWallet"
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
import { computed, ComputedRef, defineComponent, ref, Ref } from 'vue'
import { Mnemonic, MnemomicT, WalletT, StrengthT } from '@radixdlt/application'
import CreateWalletCreatePasscode from './CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from './CreateWalletCreatePin.vue'
import CreateWalletViewMnemonic from './CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from './CreateWalletEnterMnemonic.vue'
import WizardHeading from '@/components/WizardHeading.vue'
import { useSidebar, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { firstValueFrom } from 'rxjs'
import { useToast } from 'vue-toastification'

const CreateWallet = defineComponent({
  components: {
    CreateWalletCreatePasscode,
    CreateWalletCreatePin,
    CreateWalletViewMnemonic,
    CreateWalletEnterMnemonic,
    WizardHeading
  },

  setup () {
    const router = useRouter()
    const { activeNetwork, createWallet, radix, loginWithWallet, setPin, setNetwork, setWallet, walletLoaded, waitUntilAllLoaded } = useWallet(router)
    const { setState } = useSidebar()
    const newWallet: Ref<WalletT | null> = ref(null)
    const mnemonicStrength: Ref<StrengthT> = ref(StrengthT.WORD_COUNT_12)
    const toast = useToast()

    const mnemonic: ComputedRef<MnemomicT> = computed(() => Mnemonic.generateNew({ strength: mnemonicStrength.value }))

    const mnemonicWordLength: ComputedRef<string> = computed(() => {
      if (mnemonicStrength.value === StrengthT.WORD_COUNT_18) return '18'
      else if (mnemonicStrength.value === StrengthT.WORD_COUNT_24) return '24'
      else return '12'
    })

    const handleSetSeedStrength = (strength: StrengthT) => { mnemonicStrength.value = strength }

    let network = activeNetwork.value
    if (!network) {
      radix.connect('https://mainnet.radixdlt.com').then(() => {
        return firstValueFrom(radix.ledger.networkId())
      }).then((net) => {
        setNetwork(net)
        network = net
      }).catch(() => {
        toast.error('Unable to connect to mainnet')
        router.push('/')
      })
    }
    const step = ref(0)
    const passcode = ref('')
    const handleCreateWallet = async (pass: string) => {
      if (!network) return
      createWallet(mnemonic.value, pass, network).then((wallet: WalletT) => {
        newWallet.value = wallet
        step.value = 3
        passcode.value = pass
      })
    }

    const handleEnterPin = (val: boolean): void => { step.value = val ? 4 : 3 }

    const handleCreatePin = (pin: string): void => {
      if (!newWallet.value) return
      setWallet(newWallet.value)
      setPin(pin)
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

    return {
      mnemonic,
      mnemonicStrength,
      mnemonicWordLength,
      step,
      passcode,
      network,

      // methods
      handleCreateWallet,
      handleEnterPin,
      handleCreatePin,
      handleSetSeedStrength
    }
  }
})

export default CreateWallet
</script>
