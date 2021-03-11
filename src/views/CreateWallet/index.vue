<template>
  <div data-ci="create-wallet-view">
    <router-link to="/" class="mb-4">
      <img alt="Vue logo" src="../../assets/logo.png" class="w-24">
    </router-link>

    <h1 class="mb-4">Create Wallet</h1>

    <create-wallet-view-mnemonic
      v-if="step == 0"
      :mnemonic="mnemonic"
      @confirm="step = 1"
    >
    </create-wallet-view-mnemonic>

    <create-wallet-enter-mnemonic
      v-if="step == 1"
      :mnemonic="mnemonic"
      @confirm="step = 2"
      @back="step = 0"
    >
    </create-wallet-enter-mnemonic>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CreateWalletViewMnemonic from './CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from './CreateWalletEnterMnemonic.vue'
import RadixService from '@/services/radix'

const CreateWallet = defineComponent({
  setup () {
    return {
      radixService: new RadixService()
    }
  },

  components: {
    CreateWalletViewMnemonic,
    CreateWalletEnterMnemonic
  },

  data () {
    return {
      mnemonic: [] as string[],
      step: 0
    }
  },

  mounted () {
    this.mnemonic = this.radixService.generateMnemonic()
  }
})

export default CreateWallet
</script>
