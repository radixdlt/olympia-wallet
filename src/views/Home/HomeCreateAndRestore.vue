<template>
  <div class="flex flex-row">
    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm mr-5">
      <h2 class="font-extralight text-4xl leading-tight text-rBlack mb-4">I don’t have any Radix Network accounts yet.</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">
        If you’re new to Radix and wish to get started with the Radix Network and XRD token, this wallet application is now obsolete. You should instead use the new Radix Wallet apps for iOS and Android. Click below to get started.
      </p>
      <a
        href="https://wallet.radixdlt.com"
        target="_blank"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-rGreen border border-rGreen text-white font-normal leading-tight rounded"
      >
        Download the New Radix Wallet
      </a>
    </div>

    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm">
      <h2 class="font-extralight text-4xl leading-tight text-rBlack mb-4">I have a Radix (Olympia) seed phrase.</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">
        If you previously created accounts using this app, the Radix Olympia Desktop Wallet, you can still restore them from your seed phrase and then use this app to export them for use in the new Radix Wallet apps for iOS and Android.
      </p>
      <router-link
        to="/restore-wallet"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-none border border-rGreen text-rGreen font-normal leading-tight rounded"
      >
        Restore from Seed Phrase
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const HomeCreateAndRestore = defineComponent({
})

export default HomeCreateAndRestore
</script>
