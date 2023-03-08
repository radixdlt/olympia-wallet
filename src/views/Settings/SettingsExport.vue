<template>
  <div>
  <div class="bg-white flex flex-col rounded-full w-full min-h-full p-10">
    <div class="flex justify-between">
      <div class="text-rGrayDark mb-6 text-sm max-w-lg">
        <p>{{ $t("settings.export.title") }}</p>
        <br />
        <p>{{ $t("settings.export.description") }}</p>
      </div>
      <div class="flex flex-col gap-y-2" v-if="!isExporting">
        <div>
          <button-submit :disabled="false" :small="true" @click="addAll">
            Add All Accounts
          </button-submit>
        </div>
        <div>
          <button-submit :disabled="selectedAccounts.length == 0" :small="true" @click="exportAccounts" class="w-full">
            Export
          </button-submit>
        </div>
      </div>
    </div>
    <div v-if="isExporting">
      <div class="w-full text-left flex flex-col gap-1 mb-2">
        <p>Total Accounts: {{ completedExports }} / {{ totalExports }}</p>
        <p v-if="totalSoftwareExports > 0">Software Accounts: {{ exportedSoftwareAccounts.length }} / {{ totalSoftwareExports }}</p>
        <p v-if="(totalExports - totalSoftwareExports > 0)">Hardware Accounts: {{ exportedHardwareAccounts.length }} / {{ totalExports - totalSoftwareExports }}</p>
      </div>
      <div class="flex flex-col gap-2" v-if="isLoading">
        <div class="inline-flex text-left gap-x-2">
          <div>
            <p class="text-sm">Version</p>
            <input v-model="version" class="border p-2 rounded-md w-16" />
          </div>
          <div>
            <p class="text-sm">Error Correction</p>
            <select v-model="activeCorrectionLevel" class="border p-2 rounded-md w-16">
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="Q">Q</option>
              <option value="H">H</option>
            </select>
          </div>
        </div>
        <div v-for="(device, index) in relevantDevices" :key="index" >
          <div class="w-full flex justify-between border rounded-md py-1 px-3 items-center">
            <span>{{ device.name }}: {{ device.addresses.length }} Accounts</span>
            <div v-if="completedDevices.includes(device)" class="flex gap-2">
              <span class="text-rGreen">Completed</span>
            </div>
            <div v-else>
              <button-submit :disabled="false" :small="true" @click="startDeviceExport(device)">
                Ready
              </button-submit>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
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
        <button @click="copy" class="border border-solid border-rGrayDark rounded py-2.5 font-sm text-rGrayDark cursor-pointer transition-colors focus:outline-none w-44" v-if="fullExport">
          Copy Export
        </button>
        <button-submit :disabled="completedExports < totalExports" @click="showQRCode" class="w-44" :small="true" v-if="isLoading">
          Show QR Codes
        </button-submit>
      </div>
    </div>
    <div v-else>
      <div class="flex flex-col gap-4">
        <div class="border-b pb-1 flex items-center justify-between">
          <p>{{ $t("settings.export.software") }}</p>
          <button-submit :disabled="false" :small="true" @click="toggleAllSoftware">
            {{ allSoftwareSelected ? "Deselect All" : "Select All" }}
          </button-submit>
        </div>
        <export-account-list-item
          v-for="account in localAccounts"
          :key="account.address.toString()"
          :address="account.address"
          :name="accountNameFor(account.address)"
          :selected="selectedAccounts"
          @toggle="toggleAddress"
        />
      </div>
      <div v-for="(device, i) in hardwareDevices" :key="i" class="mt-4 flex flex-col gap-4">
        <p class="border-b pb-1">{{ device.name  }}</p>
        <export-account-list-item
          v-for="address in device.addresses"
          :key="address.toString()"
          :address="address.address"
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
import { AccountAddressT, AccountT, Amount, AmountT, Token } from '@radixdlt/application'
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { useToast } from 'vue-toastification'
import papaparse from 'papaparse'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { add } from '@/helpers/arithmetic'
import { asBigNumber } from '@/helpers/asBigNumber'
import ExportAccountListItem from './ExportAccountListItem.vue'
import { firstValueFrom } from 'rxjs'
import { HardwareDevice } from '@/services/_types'
import { QRCodeOptions, toDataURL } from 'qrcode'

const zero = Amount.fromUnsafe(0)._unsafeUnwrap()

type ExportedAccount = {
  name: string
  balance: string
  publicKey: string
  derivationPath: string
  deviceName: string
}

const columns = ['publicKey', 'derivationPath', 'balance', 'name', 'deviceName']

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
const chunkIntoURLs = async (str: string, options: QRCodeOptions) : Promise<string[]> => {
  const r: string[] = []
  let offset = 0
  const defaultSize = 2000
  let currentChunkSize = defaultSize

  while (offset < str.length) {
    try {
      const result = await stringToQRUrl(str.substr(offset, currentChunkSize), options)
      r.push(result)
      offset += currentChunkSize
      if (currentChunkSize !== defaultSize) currentChunkSize = defaultSize
    } catch (e) {
      currentChunkSize = currentChunkSize - 100
      continue
    }
  }

  return r
}

export default defineComponent({
  components: {
    ButtonSubmit,
    ExportAccountListItem
  },

  setup () {
    const router = useRouter()
    const toast = useToast()
    const { accounts, accountNameFor, activateAccount, setActiveAddress, decimalType, hardwareDevices, nativeToken, radix } = useWallet(router)
    const isExporting = ref(false)
    const isLoading = ref(true)
    const totalExports = ref(0)
    const completedExports = ref(0)
    const totalSoftwareExports = ref(0)
    const relevantDevices: Ref<HardwareDevice[]> = ref([])
    const exportedSoftwareAccounts: Ref<ExportedAccount[]> = ref([])
    const exportedHardwareAccounts: Ref<ExportedAccount[]> = ref([])
    const completedDevices: Ref<HardwareDevice[]> = ref([])
    const mnemonicLength = ref(0)
    const qrCodes: Ref<string[]> = ref([])
    const activeQRCode = ref(0)

    const activeCorrectionLevel = ref('M')
    const version = ref(38)
    const fullExport = ref('')

    const QROptions = computed(() => {
      return {
        errorCorrectionLevel: activeCorrectionLevel.value as QRCodeOptions['errorCorrectionLevel'],
        version: version.value
      }
    })

    const localAccounts: ComputedRef<AccountT[]> = computed(() => {
      if (!accounts.value) return []
      return accounts.value.all.filter((account: AccountT) => {
        return account.signingKey.isLocalHDSigningKey
      })
    })

    const fetchBalance = async (address: AccountAddressT, native: Token): Promise<string> => {
      const balances = await firstValueFrom(radix.ledger.tokenBalancesForAddress(address))
      const nativeTokenBalance = balances.account_balances.liquid_balances.find((lb) => lb.token_identifier.rri.equals(native.rri))
      if (!nativeTokenBalance) return '0'
      const balance = add(nativeTokenBalance.value, balances.account_balances.staked_and_unstaking_balance.value || zero)
      return asBigNumber(balance as AmountT, true, decimalType.value)
    }

    const selectedAccounts = ref<string[]>([])

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

    const toggleAllSoftware = () => {
      const localAddrs = localAccounts.value.map((account) => account.address.toString())
      if (allSoftwareSelected.value) {
        selectedAccounts.value = selectedAccounts.value.filter((addr) => !localAddrs.includes(addr))
      } else {
        selectedAccounts.value = [...selectedAccounts.value, ...localAddrs]
      }
    }

    const addAll = () => {
      const localAddrs = localAccounts.value.map((account) => account.address.toString())
      const hardwareAddresses = hardwareDevices.value.flatMap((device) => device.addresses.map((address) => address.address.toString()))
      selectedAccounts.value = [...localAddrs, ...hardwareAddresses]
    }

    const encode = (str: string): string => {
      return btoa(unescape(encodeURIComponent(str))).replace(/=/g, '')
    }

    const accountSummary = async (account: AccountT, isLocal: boolean): Promise<ExportedAccount | null> => {
      if (!nativeToken.value) return null
      const name = accountNameFor(account.address)
      const address = account.address.toString()
      const balance = await fetchBalance(account.address, nativeToken.value)
      completedExports.value = completedExports.value + 1

      const deviceName = isLocal ? '' : relevantDevices.value.find((device) => {
        return device.addresses.find((hwAddr) => hwAddr.address.toString() === address)
      })?.name || ''

      return {
        name,
        balance,
        publicKey: account.publicKey.toString(),
        deviceName: encode(deviceName),
        derivationPath: `${account.hdPath?.toString()}${isLocal ? 'H' : ''}`.replace("'", '')
      }
    }

    const exportAccounts = async () => {
      isExporting.value = true
      isLoading.value = true
      qrCodes.value = []
      exportedSoftwareAccounts.value = []
      completedExports.value = 0
      const selectedLocalAccounts = localAccounts.value.filter((account) => selectedAccounts.value.includes(account.address.toString()))
      totalSoftwareExports.value = selectedLocalAccounts.length
      totalExports.value = selectedAccounts.value.length
      const fetchLocal = selectedLocalAccounts.map((account) => {
        return accountSummary(account, true)
      })

      relevantDevices.value = hardwareDevices.value.map((hwDevice: HardwareDevice) => {
        const availableAddresses = hwDevice.addresses.filter((hwAddr) => {
          return selectedAccounts.value.includes(hwAddr.address.toString())
        })
        return { ...hwDevice, addresses: availableAddresses }
      }).filter((hwDevice) => hwDevice.addresses.length > 0)
      const allLocal = await Promise.all(fetchLocal)

      exportedSoftwareAccounts.value = allLocal.filter((account) => account !== null) as ExportedAccount[]

      const mnemonic = await firstValueFrom(radix.revealMnemonic())
      mnemonicLength.value = mnemonic.words.length
    }

    const startDeviceExport = async (device: HardwareDevice) => {
      const deviceExports = []
      for (const address of device.addresses) {
        setActiveAddress(address.address.toString())
        const nextAccount = await activateAccount()
        if (!nextAccount) throw new Error('Could not activate account')
        const summary = await accountSummary(nextAccount, false)
        if (!summary) break
        deviceExports.push(summary)
        exportedHardwareAccounts.value = [...exportedHardwareAccounts.value, summary]
      }
      completedDevices.value = [...completedDevices.value, device]
    }

    const showQRCode = async () => {
      isLoading.value = false
      activeQRCode.value = 0
      const accounts = [...exportedSoftwareAccounts.value, ...exportedHardwareAccounts.value]
      const data = papaparse.unparse({
        fields: columns,
        data: accounts
      }, { header: false })
      const allData = `mnemonic ${mnemonicLength.value}
${data}
`
      console.log(allData)
      console.log('data length is', allData.length)
      fullExport.value = allData
      qrCodes.value = await chunkIntoURLs(allData, QROptions.value)
    }

    const closeModal = () => {
      isLoading.value = false
      isExporting.value = false
      fullExport.value = ''
      qrCodes.value = []
    }

    const copy = () => {
      copyToClipboard(fullExport.value)
      toast.success('Copied to Clipboard')
    }

    return {
      activeQRCode,
      activeCorrectionLevel,
      allSoftwareSelected,
      completedExports,
      completedDevices,
      exportedHardwareAccounts,
      exportedSoftwareAccounts,
      hardwareDevices,
      isExporting,
      isLoading,
      qrCodes,
      localAccounts,
      relevantDevices,
      selectedAccounts,
      totalExports,
      totalSoftwareExports,
      QROptions,
      version,
      fullExport,

      accountNameFor,
      addAll,
      closeModal,
      exportAccounts,
      startDeviceExport,
      showQRCode,
      toggleAddress,
      toggleAllSoftware,
      copy
    }
  }
})
</script>
