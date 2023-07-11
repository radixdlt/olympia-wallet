<template>
  <div>
    <div class="bg-white flex flex-col rounded-full rounded-tr-none w-full min-h-full p-10">
      <div class="flex justify-between">
        <div class="mb-6 max-w-lg text-sm leading-5">
          <p class="mb-3">
            If you have completed migrating your accounts to the new Radix Wallet mobile app for Babylon, <span class="font-medium">the Olympia wallet still contains an active seed phrase</span> that can be used to gain access to accounts not secured by a Ledger hardware device.
          </p>
          <p class="mb-3">Please complete <button @click="setTab('export')" class="font-medium inline">exporting your accounts</button> to the new Radix Wallet for Babylon, check that all of your accounts are listed there, and then click the button below to begin the process of completely deleting this Wallet's data.
          </p>
          <div class="mb-3">
            <button @click="continueToDelete" class="inline-flex justify-center rounded border-transparent shadow-sm px-4 py-3 text-base focus:outline-none bg-rRed border-4 border-rRed text-white ">Delete All Wallet Data</button>
          </div>
          <p>
            After this is complete, you will not need the Olympia Desktop Wallet application, and it can be deleted.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useSettingsTab, useHomeModal, useHomeForgotPassword } from '@/composables'
import { useRouter } from 'vue-router'

export default {
  setup () {
    const { setTab } = useSettingsTab()
    const { setModal } = useHomeModal()
    const { setMode } = useHomeForgotPassword()
    const router = useRouter()

    const continueToDelete = () => {
      setModal('forgot-password')
      setMode('create')
      router.push({ name: 'Home' })
    }
    return {
      setTab, continueToDelete
    }
  }
}
</script>
