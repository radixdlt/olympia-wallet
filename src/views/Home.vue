<template>
  <div data-ci="home-view">
    <img alt="Vue logo" src="../assets/logo.png" class="w-24">
    <router-link
      to="/create-wallet"
      data-ci="create-wallet-button"
      class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      + New Wallet
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
