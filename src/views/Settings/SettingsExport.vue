<template>
  <div>
  <div class="bg-white flex flex-col rounded-full w-full min-h-full p-10">
    <div class="flex justify-between">
      <div class="text-rGrayDark mb-6 text-sm max-w-lg">
        <p>{{ $t("settings.export.title") }}</p>
        <br />
        <p>{{ $t("settings.export.description") }}</p>
        <div v-if="hiddenAccounts.length > 0" class="mt-2">
          <label><input type="checkbox" v-model="includeHiddenAccounts" name="hidden"/> Include hidden accounts in the export</label>
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
    <div v-if="isExporting">
      <div>
        <p>Scan your QR {{qrCodes.length > 1 ? 'Codes' : 'Code'}} into the Babylon Wallet</p>
        <div class="flex justify-between items-center">
          <button :disabled="activeQRCode == 0" @click="activeQRCode--">
            Previous
          </button>
          <span>{{ activeQRCode + 1 }} of {{ qrCodes.length }}</span>
          <button :disabled="activeQRCode == qrCodes.length" @click="activeQRCode++">
            Next
          </button>
        </div>
        <div class="flex justify-center">
          <img :src="qrCodes[activeQRCode]" />
        </div>
      </div>
      <div class="flex flex-row space-x-5 justify-center my-4">
        <button @click="closeModal" class="border border-solid border-rGrayDark rounded py-2.5 font-sm text-rGrayDark cursor-pointer transition-colors focus:outline-none w-44">
          Close
        </button>
        <button @click="copy" :disabled="qrCodes.length == 0" class="border border-solid border-rGrayDark rounded py-2.5 font-sm text-rGrayDark cursor-pointer transition-colors focus:outline-none w-44" v-if="fullExport.length > 0">
          Copy Export
        </button>
      </div>
    </div>
    <div v-else>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef, ref, Ref } from 'vue'
import { AccountT } from '@radixdlt/application'
import { AccountAddressT } from '@radixdlt/account'
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { useToast } from 'vue-toastification'
import { useOfflineWallet, useWallet } from '@/composables'
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
    const toast = useToast()
    const router = useRouter()
    const { accounts, hardwareDevices, fetch, revealMnemonic } = useOfflineWallet()
    const { hiddenAccounts, accountNameFor } = useWallet(router)

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

    const allSoftwareSelected = computed(() => {
      return localAccounts.value.every((account) => selectedAccounts.value.includes(account.address.toString()))
    })

    const addAll = () => {
      const localAddrs = localAccounts.value.map((account) => account.address.toString())
      const hardwareAddresses = hardwareDevices.value.flatMap((device) => device.addresses.map((address) => address.address.toString()))
      selectedAccounts.value = [...localAddrs, ...hardwareAddresses]
      exportAccounts()
    }

    const accountSummary = (address: AccountAddressT, addressIndex: number, isLocal: boolean): string => {
      const name = accountNameFor(address)
      const localType = isLocal ? 'S' : 'H'
      const compressedKey = compressPublicKeyToHex(address.publicKey.toString())

      return accountToExportPayload(localType, compressedKey, addressIndex, name)
    }

    const exportAccounts = async () => {
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

      mnemonicLength.value = mnemonic?.words.length
      const allData = exportAsCode(accounts, 1800, mnemonicLength.value)
      qrCodes.value = await chunkIntoURLs(allData, QROptions.value)
      fullExport.value = allData
      isLoading.value = false
    }

    const closeModal = () => {
      isLoading.value = false
      isExporting.value = false
      fullExport.value = []
      qrCodes.value = []
    }

    const copy = () => {
      copyToClipboard(fullExport.value.join('\n'))
      toast.success('Copied to Clipboard')
    }
    const isHidden = (address: AccountAddressT) => {
      return hiddenAccounts.value.map((hidden) => hidden.address).includes(address.toString())
    }

    return {
      activeQRCode,
      activeCorrectionLevel,
      allSoftwareSelected,
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
      copy
    }
  }
})
</script>
