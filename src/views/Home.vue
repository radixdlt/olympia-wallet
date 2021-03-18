<template>
  <div data-ci="home-view" class="flex flex-row py-8 px-5 min-h-screen">
    <div class="w-72 mr-5">
      <img alt="Radix DLT Logo" src="../assets/logo.svg" class="w-30 mb-10">
      <p class="text-white font-normal text-normal leading-snug mr-12">
        Welcome to the Radix Betanet.
        <br/><br/>
        Decentralized finance applications are currently being built on protocols that were not designed to meet the needs and requirements of DeFi services.
        <br/><br/>
        Radix is using our significant technology innovations to be the first layer 1 protocol specifically built to serve the rapidly growing DeFi industry.
      </p>
    </div>

    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm mr-5">
      <h2 class="font-extralight text-5xl leading-snug text-rBlack mb-4">I don't have a wallet yet!</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">
        You’re new to Radix, create a new wallet to get started holding, sending, and staking XRD.
      </p>
      <router-link
        to="/create-wallet"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-rGreen border border-rGreen text-white font-normal leading-snug rounded"
      >
        Create a new wallet
      </router-link>
    </div>

    <div class="bg-white rounded py-9 px-11 flex flex-col max-w-sm">
      <h2 class="font-extralight text-5xl leading-snug text-rBlack mb-4">I already have a wallet</h2>
      <p class="text-rBlack font-normal text-normal leading-snug flex-1">
        You have an existing wallet and know your recovery password or have a hardware wallet start here.
      </p>
      <router-link
        to="/create-wallet"
        data-ci="create-wallet-button"
        class="inline-flex items-center justify-center px-6 py-5 bg-none border border-rGreen text-rGreen font-normal leading-snug rounded"
      >
        Restore a previous wallet
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
