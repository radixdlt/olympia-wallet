<template>
  <div class="relative bg-white w-full flex-1">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col pt-20 pb-6 pl-16 pr-8 relative z-10 max-w-lg"
    >
      <h2 class="text-5xl text-rBlack font-thin leading-tight mb-9">{{ $t('account.editDeviceNameHeading') }}</h2>
      <input
        v-model="name"
        class="w-full border-t-0 border-r-0 border-l-0 py-5 border-b border-rBlack leading-8 focus:ring-0 focus:outline-none focus:border-rGreen mb-40 max-w-sm border"
        :placeholder="$t('account.nameInputPlaceholder')"
      />

      <ButtonSubmit :disabled="!name">
        {{ $t('account.updateNameButton') }}
      </ButtonSubmit>
    </form>

    <img src="@/assets/account.svg" class="absolute right-0 top-0 h-full" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { saveDeviceName, getHardwareDevices } from '@/actions/vue/data-store'
import { ref } from '@nopr3d/vue-next-rx'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useWallet } from '@/composables'
import { useRouter, useRoute } from 'vue-router'

const WalletDeviceEditName = defineComponent({
  components: {
    ButtonSubmit
  },

  setup () {
    const name = ref('')
    const router = useRouter()
    const route = useRoute()

    const { activeAddress, deviceRenamed, deviceNameFor, activeNetwork } = useWallet(router)
    if (!activeAddress.value) {
      return
    }
    const allDevices = async () => {
      if (!activeNetwork.value) return
      const devices = await getHardwareDevices(activeNetwork.value)
      return devices
    }

    const selectedDeviceIndex = async () => {
      const devices = await allDevices()
      if (!devices) return
      for (const device of devices) {
        if (device.addresses[0].address.toString() === route.params.firstAccount) {
          return devices.indexOf(device)
        }
      }
    }

    const selectedDeviceName = async () => {
      const devices = await allDevices()
      if (!devices) return
      for (const device of devices) {
        if (device.addresses[0].address.toString() === route.params.firstAccount) {
          return device.name
        }
      }
    }
    // Update input value if active address changes
    selectedDeviceName()
      .then((deviceName) => {
        if (!deviceName) return
        name.value = deviceName
      })
    // name.value = storedName

    const handleSubmit = () => {
      selectedDeviceIndex()
        .then((idx) => {
          if (!activeNetwork.value || idx) return
          saveDeviceName(idx, activeNetwork.value, name.value)
          deviceRenamed(name.value)
        })
    }

    return { name, handleSubmit }
  }
})

export default WalletDeviceEditName
</script>
