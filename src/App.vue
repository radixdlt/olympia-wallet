<template>
  <div class="relative bg-gradient-to-r from-rBlue via-blueMid to-blueEnd min-h-screen overflow-hidden font-sans antialiased">
    <div class="bg-rBlue w-1/2 h-tallest origin-center transform rotate-45 absolute z-0 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
    <img src="./assets/lines.svg" class="absolute left-0 bottom-0 z-0">
    <div class="relative z-10 min-h-screen">
      <router-view/>
    </div>
  </div>
</template>

<style>
</style>
