<template>
  <div class="w-64 pt-6 text-white overflow-y-auto fixed top-0 left-0 h-full bg-rBlueDark z-30 overflow-x-hidden no-scroll">
    <div @click="setState(false)" class="hover:text-rGreen cursor-pointer transition-colors inline-flex flex-row items-center mb-6 px-6">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2" >
        <circle cx="10" cy="10" r="9.5" transform="rotate(90 10 10)" fill="none" class="stroke-current"  />
        <path d="M12 15L7 10L12 5" class="stroke-current" stroke-miterlimit="10"/>
      </svg>
      {{ $t('wallet.back') }}
    </div>
    <div :class="{'bg-gradient-to-br from-rBlue via-rDarkblue to-rDarkblue': true, 'pb-4': showSoftwareAccounts }">
      <div class="flex items-center px-4 py-4">
        <svg width="24" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="24" height="18.1333" rx="2" fill="#060F8F"/>
          <path d="M21.2667 4.46667H3C1.89543 4.46667 1 5.3621 1 6.46667V17.1333C1 18.2379 1.89543 19.1333 3 19.1333H23C24.1046 19.1333 25 18.2379 25 17.1333V3C25 1.89543 24.1046 1 23 1H3C1.89543 1 1 1.89543 1 3V3.13333" stroke="white" stroke-linecap="round"/>
          <rect x="1" y="4.7334" width="22.4" height="11.7333" rx="4" fill="#060F8F"/>
          <path d="M21.2667 4.4668H3C1.89543 4.4668 1 5.36223 1 6.4668V17.1335C1 18.238 1.89543 19.1335 3 19.1335H23C24.1046 19.1335 25 18.238 25 17.1335V10.6001" stroke="white" stroke-linecap="round"/>
          <path d="M8.86655 14.0333L5.46655 11.7667L8.86655 9.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.8 14.0333L20.2 11.7667L16.8 9.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11.7 15.1667L13.9666 8.3667" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="pl-2 text-sm">
          {{ $t('wallet.softwareWallets') }}
        </div>
        <svg v-if="showSoftwareAccounts" @click="toggleSoftwareAccounts" class="ml-auto text-rGrayDark hover:text-rGreen transition-colors" width="17" height="17" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="stroke-current" d="M2 7H5V10" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M10 5H7V2" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M7 5L10.5 1.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M1.5 10.5L5 7" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else @click="toggleSoftwareAccounts" class="ml-auto stroke-current text-rGrayDark hover:text-rGreen transition-colors" width="15" height="15" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="stroke-current" d="M7.5 1.5H10.5V4.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M4.5 10.5H1.5V7.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M10.5 1.5L7 5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="stroke-current" d="M1.5 10.5L5 7" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div v-if="showSoftwareAccounts">
        <account-list-item
          v-for="account in localAccounts"
          :key="account.address.toString()"
          :address="account.address"
          @click="debugSwitch(account)"
          class="mb-4"
        />
        <div @click="addSoftwareAccount" class="mx-4 mt-4 py-4 text-center cursor-pointer hover:text-rGreen transition-colors text-xs border-rGrayMed border-b">
          {{ $t('wallet.addSoftwareAccount') }}
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-rBlue via-rDarkblue to-rDarkblue h-full">
      <div class="border-rGray border-opacity-50">
        <div class="flex items-center py-4 mx-4 border-b border-rGrayMed px-1">
          <svg width="28" viewBox="0 0 29 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 9.39837L1 18.2217L7.02673 18.2217L7.02673 9.39837L1 9.39837Z" stroke="white" stroke-miterlimit="10"/>
            <path d="M2.52002 15.6089L5.5063 15.6089" stroke="white" stroke-miterlimit="10"/>
            <path d="M2.52002 12.0103L5.5063 12.0103" stroke="white" stroke-miterlimit="10"/>
            <path d="M27.7079 11.3367V10.1685C27.7079 7.95932 25.917 6.16846 23.7079 6.16846H11.0349C8.82577 6.16846 7.03491 7.95932 7.03491 10.1685V17.6732C7.03491 19.8823 8.82578 21.6732 11.0349 21.6732H23.7079C25.9171 21.6732 27.7079 19.8823 27.7079 17.6732V16.1819" stroke="white"/>
            <path d="M27.7079 11.3364V7.58398C27.7079 5.37485 25.917 3.58398 23.7079 3.58398H11.0349C8.82577 3.58398 7.03491 5.37484 7.03491 7.58398V11.3364" stroke="white"/>
            <path d="M27.7079 8.75238V5C27.7079 2.79086 25.917 1 23.7079 1H11.0349C8.82577 1 7.03491 2.79086 7.03491 5V8.75238" stroke="white"/>
            <path d="M23.0398 13.9206C23.0398 12.7695 23.9729 11.8364 25.1239 11.8364H28.5001V16.0047H25.1239C23.9729 16.0047 23.0398 15.0716 23.0398 13.9206Z" stroke="white"/>
          </svg>
          <div class="pl-2 text-sm">
            {{ $t('wallet.hardwareWallets') }}
          </div>
          <svg v-if="showHardwareAccounts" @click="toggleShowHardwareAccounts" class="ml-auto" width="17" height="17" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-current" d="M2 7H5V10" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M10 5H7V2" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M7 5L10.5 1.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M1.5 10.5L5 7" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else @click="toggleShowHardwareAccounts" class="ml-auto stroke-current text-rGrayDark hover:text-rGreen transition-colors" width="15" height="15" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-current" d="M7.5 1.5H10.5V4.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M4.5 10.5H1.5V7.5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M10.5 1.5L7 5" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="stroke-current" d="M1.5 10.5L5 7" stroke="#F2F2FC" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div v-if="hardwareDevices.length > 0">
          <div v-for="(hardwareDevice, i) in nonHiddenHardwareDevices" :key="i">
            <div>
              <div class="flex items-center justify-between group py-5 mx-4 px-1">
                <div class="flex cursor-pointer items-center">
                  <svg height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rGreen" :class="{'fill-current': isActiveDevice(hardwareDevice)}">
                    <path d="M18.7382 10.6172H7.26074V19H18.7382V10.6172Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
                    <path d="M10.6592 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
                    <path d="M15.3405 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
                    <path d="M1.45471 18.9997H24.5453V21.4505C24.5453 23.4596 22.9165 25.0883 20.9074 25.0883H5.09253C3.08342 25.0883 1.45471 23.4596 1.45471 21.4505V18.9997Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
                    <path d="M24.5449 7L1.45438 7V4.54926C1.45438 2.54016 3.08309 0.91145 5.09219 0.91145L20.9071 0.91145C22.9162 0.91145 24.5449 2.54016 24.5449 4.54926V7Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
                  </svg>
                  <span class="text-white ml-2 text-sm truncate w-36"> {{ hardwareDevice.name }} </span>
                </div>
                <div class="flex flex-grow-0 items-center gap-2">
                  <div @click.stop="handleAccountEditName(hardwareDevice)" class="invisible group-hover:visible text-rGrayDark hover:text-rGreen transition-colors cursor-pointer">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.59916 -0.000175769L0.836914 5.65283L3.23785 8.00825L9.0001 2.35524L6.59916 -0.000175769Z" fill="#F2F2FC"/>
                        <path d="M0 8.86212L2.47781 8.75379L0.0768395 6.39844L0 8.86212Z" fill="#F2F2FC"/>
                      </svg>
                  </div>
                  <div @click="disconnectDevice(i)" class="flex text-rGrayDark hover:text-rGreen transition-colors cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path class="stroke-current" d="M3.20657 5.50278L1.89417 6.81518C0.535275 8.17407 0.535276 10.3773 1.89417 11.7362C3.25307 13.0951 5.45628 13.0951 6.81518 11.7362L7.87636 10.675M10.3264 8.225L11.7362 6.81518C13.0951 5.45628 13.0951 3.25307 11.7362 1.89417C10.3773 0.535275 8.17407 0.535276 6.81518 1.89417L5.65657 3.05278" stroke="#F2F2FC" stroke-linecap="round"/>
                      <path class="stroke-current" d="M4.68616 0.875L8.76949 13.125" stroke="#F2F2FC" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div v-if="deviceAccountsHidden(hardwareDevice.name)">
                <account-list-item
                  v-for="address in hardwareDevice.addresses"
                  :key="address.toString()"
                  :address="address.address"
                  @click="hardwareSwitch(address.address)"
                  class="mb-4"
                />
                <div class="mx-4 h-0 border-b border-rGrayDark"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="showHardwareAccounts" class="flex justify-center items-center px-2 border-b border-rGray border-opacity-50 py-4">
            <svg width="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.7382 10.6172H7.26074V19H18.7382V10.6172Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
              <path d="M10.6592 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10" />
              <path d="M15.3405 12.7317V16.8855" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M1.45471 18.9997H24.5453V21.4505C24.5453 23.4596 22.9165 25.0883 20.9074 25.0883H5.09253C3.08342 25.0883 1.45471 23.4596 1.45471 21.4505V18.9997Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
              <path d="M24.5449 7L1.45438 7V4.54926C1.45438 2.54016 3.08309 0.91145 5.09219 0.91145L20.9071 0.91145C22.9162 0.91145 24.5449 2.54016 24.5449 4.54926V7Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
            </svg>
            <span class="text-xs text-rGray ml-2">
              {{ $t('wallet.navAddHWWallet')}}
            </span>
          </div>
        </div>
        <div @click="createNewHardwareAccount" class="my-4 pb-6 mx-auto text-center cursor-pointer text-xs hover:text-rGreen transition-colors">
          {{ $t('wallet.navAddHWAccount') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, ComputedRef } from 'vue'
import { AccountAddressT, AccountT } from '@radixdlt/application'
import AccountListItem from '@/components/AccountListItem.vue'
import { useWallet, useSidebar } from '@/composables'
import { useRouter } from 'vue-router'
import { HardwareDevice } from '@/services/_types'

const WalletSidebarAccounts = defineComponent({
  components: {
    AccountListItem
  },

  setup () {
    const router = useRouter()
    const {
      accounts,
      activeAddress,
      addAccount,
      switchAddress,
      hardwareDevices,
      derivedAccountIndex,
      activeNetwork,
      createNewHardwareAccount,
      setDisconnectDeviceModal,
      hiddenAccounts
    } = useWallet(router)

    const { setState } = useSidebar()
    const showHardwareHelper = ref(false)
    const showSoftwareAccounts = ref(true)
    const showHardwareAccounts = ref(true)
    const hiddenHwAccounts: Ref<string[]> = ref([])

    const localAccounts: ComputedRef<AccountT[]> = computed(() => {
      if (!accounts.value) return []
      return accounts.value.all.filter((account: AccountT) => {
        const isLocalAccount = account.signingKey.isLocalHDSigningKey
        // flatten array of objects
        const newArr = hiddenAccounts.value.flatMap(acct => Object.values(acct))
        const isHidden = newArr.includes(account.address.toString())
        return isLocalAccount && !isHidden
      })
    })

    const nonHiddenHardwareDevices: ComputedRef<HardwareDevice[]> = computed(() => {
      console.log('here')
      return hardwareDevices.value.map((hwDevice: HardwareDevice) => {
        const availableAddresses = hwDevice.addresses.filter((hwAddr) => {
          const newArr = hiddenAccounts.value.flatMap(acct => Object.values(acct))
          return !newArr.includes(hwAddr.address.toString())
        })
        return { ...hwDevice, addresses: availableAddresses }
      })
    })

    const handleAccountEditName = (device: HardwareDevice) => {
      const firstAccount = device.addresses[0].address?.toString()
      router.push({ name: 'device-edit-name', params: { activeAddress: firstAccount } })
    }

    return {
      activeAddress,
      derivedAccountIndex,
      activeNetwork,
      hardwareDevices,
      showHardwareHelper,
      showSoftwareAccounts,
      showHardwareAccounts,
      localAccounts,
      nonHiddenHardwareDevices,
      handleAccountEditName,
      setState,
      addSoftwareAccount () {
        addAccount().then((account: AccountT | false) => {
          if (!account) return
          const name = router.currentRoute.value.name || 'WalletOverview'
          if (name === 'Settings') { switchAddress(account.address) }
          router.push({ name, params: { activeAddress: account.address.toString() } })
        })
      },
      switchAddress,
      debugSwitch (account: AccountT) {
        const name = router.currentRoute.value.name || 'WalletOverview'
        router.push({ name, params: { activeAddress: account.address.toString() } })
      },
      hardwareSwitch (val: AccountAddressT) {
        const name = router.currentRoute.value.name || 'WalletOverview'
        router.push({ name, params: { activeAddress: val.toString() } })
      },
      toggleSoftwareAccounts () {
        showSoftwareAccounts.value = !showSoftwareAccounts.value
      },
      toggleShowHardwareAccounts () {
        showHardwareAccounts.value = !showHardwareAccounts.value
      },
      toggleHardwareAccounts (hardwareDevice: HardwareDevice) {
        const index = hiddenHwAccounts.value.indexOf(hardwareDevice.name)
        if (index > -1) {
          hiddenHwAccounts.value.splice(index, 1)
        } else {
          hiddenHwAccounts.value.push(hardwareDevice.name)
        }
      },
      deviceAccountsHidden (deviceName: string) {
        const hiddenDevices = Object.values(hiddenHwAccounts.value)
        return !hiddenDevices.includes(deviceName)
      },
      disconnectDevice (index: number) {
        setDisconnectDeviceModal(index)
      },
      editName (account: AccountT) {
        setState(false)
        router.push(`/wallet/${account.address.toString()}/account-edit-name`)
      },
      createNewHardwareAccount,
      isActiveDevice (hardwareDevice: HardwareDevice) {
        return !!hardwareDevice.addresses.find((hwaddr) => {
          if (!activeAddress.value) return false
          return hwaddr.address.equals(activeAddress.value)
        })
      }
    }
  }
})

export default WalletSidebarAccounts
</script>
