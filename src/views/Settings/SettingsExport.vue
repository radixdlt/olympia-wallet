<template>
  <div>
    <div class="bg-white flex flex-col rounded-full w-full min-h-full p-10">
      <div class="flex justify-between">
        <div class="mb-6 max-w-xl text-sm leading-5">
          <p class="mb-3">
            To migrate your Radix mainnet accounts, first <a href="https://wallet.radixdlt.com/" target="_blank" class="font-medium">download and setup the new Radix Wallet for Babylon</a>. If you are using a Ledger hardware wallet device, you will also need to download and link the Radix Connector browser extension.
          </p>
          <p>
            Then begin the export process by clicking "Export All" or "Export Selected" here.
          </p>
          <div v-if="hiddenAccounts.length > 0" class="mt-3">
            <label class="flex items-center"><input type="checkbox" v-model="includeHiddenAccounts" name="hidden" class="mr-2"/> Include hidden accounts in the export</label>
          </div>
        </div>
        <div class="flex flex-col gap-y-2" v-if="!isExporting">
          <div class="flex justify-end">
            <button-submit :disabled="false" :small="true" @click="addAll" class="w-36">
              Export All
            </button-submit>
          </div>
          <div>
            <button-submit :disabled="selectedAccounts.length == 0" :small="true" @click="exportAccounts" class="w-36">
              Export Selected
            </button-submit>
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-col gap-4">
          <div class="border-b pb-1 flex items-center justify-between">
            <p>{{ $t("settings.export.software") }}</p>
          </div>
          <export-account-list-item
            v-for="account in localAccounts"
            :key="account.address.toString()"
            :address="account.address"
            :is-hidden="isHidden(account.address)"
            :name="accountNameFor(account.address)"
            :selected="selectedAccounts"
            @toggle="toggleAddress"
          />
        </div>
        <div v-for="(device, i) in hardwareDevicesToDisplay" :key="i" class="mt-4 flex flex-col gap-4">
          <p class="border-b pb-1">{{ device.name  }}</p>
          <export-account-list-item
            v-for="address in device.addresses"
            :key="address.toString()"
            :address="address.address"
            :isHidden="isHidden(address.address)"
            :name="accountNameFor(address.address)"
            :selected="selectedAccounts"
            @toggle="toggleAddress"
          />
        </div>
      </div>
    </div>
    <div v-if="isExporting" class="absolute inset-0 z-50 bg-white flex flex-col max-h-screen">
      <div class="flex-grow-0 flex-shrink-0 w-full bg-rGrayLight text-rBlack text-md h-12 flex items-center justify-between px-2">
        <div>
          <p>To import your accounts, use the "Import from a Legacy Wallet" feature of the new Radix Wallet mobile app to scan this QR code.</p>
        </div>
        <button @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#003057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="#003057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="flex justify-center h-exportQRContainer">
        <img :src="qrCodes[activeQRCode]" class="aspect-square object-contain"/>
      </div>
      <div class="flex flex-row space-x-16 justify-center h-12 items-center mb-3">
        <button v-if="qrCodes.length > 1" :disabled="activeQRCode == 0" @click="activeQRCode = activeQRCode - 1" :class="{
          'border border-solid  rounded py-2.5 font-sm  cursor-pointer flex items-center justify-center gap-x-3 focus:outline-none w-52 transition-colors': true,
          'border-rGrayDark text-rGrayDark': activeQRCode == 0,
          'border-rBlue text-white bg-rBlue': activeQRCode != 0
        }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current">
            <path d="M19 12H5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          Previous
        </button>
        <span v-if="qrCodes.length > 1">
          Code: {{ activeQRCode + 1 }} / {{ qrCodes.length }}
        </span>
        <button v-if="qrCodes.length > 1 && activeQRCode != qrCodes.length - 1" @click="activeQRCode = activeQRCode + 1" class="border border-solid border-rBlue rounded py-2.5 font-sm text-white bg-rBlue cursor-pointer transition-colors focus:outline-none w-52 flex items-center justify-center gap-x-2">
          Next
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </button>

        <button v-if="activeQRCode == qrCodes.length - 1" class="border border-solid border-rGreen rounded py-2.5 font-sm text-white bg-rGreen cursor-pointer transition-colors focus:outline-none w-52" @click="finish">
          Continue to Seed Phrase
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef, ref, Ref } from 'vue'
import { AccountT } from '@radixdlt/application'
import { AccountAddressT } from '@radixdlt/account'
import { useOfflineWallet, useWallet, useSettingsTab } from '@/composables'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import ExportAccountListItem from './ExportAccountListItem.vue'
import { accountToExportPayload, compressPublicKeyToHex, exportAsCode } from '@/helpers/exportAsCode'
import { HardwareAddress, HardwareDevice } from '@/services/_types'
import { QRCodeOptions, toDataURL } from 'qrcode'
import { useRouter } from 'vue-router'

const stringToQRUrl = async (str: string, options: QRCodeOptions) : Promise<string> => {
  return new Promise((resolve, reject) => {
    toDataURL(str, options, function (err: Error | null | undefined, url: string) {
      if (err) reject(err)
      resolve(url)
    })
  })
}

/*
  This function takes a string and chunks it into QR codes
  It will try to make the QR codes as big as possible, but will reduce the size if it fails
*/
const chunkIntoURLs = async (strs: string[], options: QRCodeOptions) : Promise<string[]> => {
  const r: string[] = []
  for (const str of strs) {
    const result = await stringToQRUrl(str, options)
    r.push(result)
  }

  return r
}

const hardenedIncrement = 0x80000000

export default defineComponent({
  components: {
    ButtonSubmit,
    ExportAccountListItem
  },

  setup () {
    const router = useRouter()
    const { accounts, hardwareDevices, fetch, revealMnemonic } = useOfflineWallet()
    const { hiddenAccounts, accountNameFor } = useWallet(router)
    const { setTab } = useSettingsTab()

    fetch()
    const isExporting = ref(false)
    const isLoading = ref(true)
    const mnemonicLength = ref(0)
    const qrCodes: Ref<string[]> = ref([])
    const activeQRCode = ref(0)
    const selectedAccounts = ref<string[]>([])
    const includeHiddenAccounts = ref(true)

    const accountsToDisplay = computed(() => {
      if (!accounts.value) return []
      if (includeHiddenAccounts.value) return accounts.value.all
      const allHiddenAddresses = hiddenAccounts.value.map((addr) => addr.address)
      return accounts.value.all.filter((account) => !allHiddenAddresses.includes(account.address.toString()))
    })

    const hardwareDevicesToDisplay = computed(() => {
      if (!hardwareDevices.value) return []
      if (includeHiddenAccounts.value) return hardwareDevices.value
      const allHiddenAddresses = hiddenAccounts.value.map((addr) => addr.address)
      const devicesWithoutHidden = hardwareDevices.value.map((device) => {
        return {
          ...device,
          addresses: device.addresses.filter((addr) => !allHiddenAddresses.includes(addr.address.toString()))
        }
      }).filter((device) => device.addresses.length > 0)
      return devicesWithoutHidden
    })

    const activeCorrectionLevel = ref('M')
    const version = ref(38)
    const fullExport: Ref<string[]> = ref([])

    const QROptions = computed(() => {
      return {
        errorCorrectionLevel: activeCorrectionLevel.value as QRCodeOptions['errorCorrectionLevel'],
        version: version.value
      }
    })

    const localAccounts: ComputedRef<AccountT[]> = computed(() => {
      return accountsToDisplay.value.filter((account: AccountT) => {
        return account.signingKey.isLocalHDSigningKey
      })
    })

    const toggleAddress = (addr: string) => {
      if (selectedAccounts.value.includes(addr)) {
        selectedAccounts.value = [...selectedAccounts.value.filter((a) => a !== addr)]
      } else {
        selectedAccounts.value = [...selectedAccounts.value, addr]
      }
    }

    const addAll = () => {
      const localAddrs = localAccounts.value.map((account) => account.address.toString())
      const hardwareAddresses = hardwareDevices.value.flatMap((device) => device.addresses.map((address) => address.address.toString()))
      const allAccounts = [...localAddrs, ...hardwareAddresses]
      const hiddenAddresses = hiddenAccounts.value.map((hidden) => hidden.address)
      selectedAccounts.value = includeHiddenAccounts.value ? allAccounts : allAccounts.filter((addr) => !hiddenAddresses.includes(addr))
      exportAccounts()
    }

    const accountSummary = (address: AccountAddressT, addressIndex: number, isLocal: boolean): string => {
      const name = accountNameFor(address)
      const localType = isLocal ? 'S' : 'H'
      const compressedKey = compressPublicKeyToHex(address.publicKey.toString())

      return accountToExportPayload(localType, compressedKey, addressIndex, name)
    }

    const exportAccounts = async () => {
      const hiddenAddresses = hiddenAccounts.value.map((hidden) => hidden.address)
      if (!includeHiddenAccounts.value) {
        selectedAccounts.value = selectedAccounts.value.filter((addr) => !hiddenAddresses.includes(addr))
      }

      isExporting.value = true
      isLoading.value = true
      qrCodes.value = []
      const accounts: string[] = []
      const mnemonic = revealMnemonic()
      if (!mnemonic) throw new Error('No Mnemonic')
      localAccounts.value
        .filter((account) => selectedAccounts.value.includes(account.address.toString()) && account.hdPath)
        .forEach((account) => {
          if (!account.hdPath) throw new Error('Account does not have an HD path')
          if (account.hdPath.addressIndex.index < hardenedIncrement) throw new Error('Unhardened Address Index')
          const addressIndex = account.hdPath.addressIndex.index - hardenedIncrement
          const exportedAccount = accountSummary(account.address, addressIndex, true)
          accounts.push(exportedAccount)
        })

      hardwareDevices.value
        .flatMap((hwDevice: HardwareDevice) =>
          hwDevice.addresses.filter((hwAddr) => selectedAccounts.value.includes(hwAddr.address.toString()))
        )
        .forEach((hwAddr: HardwareAddress) => {
          const exportedAccount = accountSummary(hwAddr.address, hwAddr.index, false)
          accounts.push(exportedAccount)
        })

      const options = {
        errorCorrectionLevel: 'M' as QRCodeOptions['errorCorrectionLevel']
      }

      mnemonicLength.value = mnemonic?.words.length
      const allData = exportAsCode(accounts, 1800, mnemonicLength.value)
      qrCodes.value = await chunkIntoURLs(allData, options)
      fullExport.value = allData
      isLoading.value = false
    }

    const closeModal = () => {
      isLoading.value = false
      isExporting.value = false
      fullExport.value = []
      qrCodes.value = []
    }

    const isHidden = (address: AccountAddressT) => {
      return hiddenAccounts.value.map((hidden) => hidden.address).includes(address.toString())
    }

    const finish = () => {
      isExporting.value = false
      qrCodes.value = []
      activeQRCode.value = 0
      fullExport.value = []
      setTab('mnemonic')
    }

    return {
      activeQRCode,
      activeCorrectionLevel,
      hardwareDevices,
      hiddenAccounts,
      includeHiddenAccounts,
      isExporting,
      isLoading,
      qrCodes,
      localAccounts,
      selectedAccounts,
      QROptions,
      version,
      fullExport,
      hardwareDevicesToDisplay,

      accountNameFor,
      addAll,
      closeModal,
      exportAccounts,
      isHidden,
      toggleAddress,
      finish
    }
  }
})
</script>
