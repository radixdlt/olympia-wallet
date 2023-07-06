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
import { defineComponent, watch } from 'vue'
import { saveDeviceName, getHardwareDevices } from '@/actions/vue/data-store'
import { ref } from '@nopr3d/vue-next-rx'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useOfflineWallet, useWallet } from '@/composables'
import { useRouter } from 'vue-router'

const WalletDeviceEditName = defineComponent({
  components: {
    ButtonSubmit
  },

  setup () {
    const name = ref('')
    const router = useRouter()
    const { fetch } = useOfflineWallet()

    const { activeAddress, deviceRenamed, activeNetwork } = useWallet(router)
    if (!activeAddress.value) {
      return
    }

    const allDevices = async () => {
      if (!activeNetwork.value) return
      const devices = await getHardwareDevices(activeNetwork.value)
      return devices
    }

    const selectedDevice = async () => {
      const devices = await allDevices()
      if (!devices) return
      return devices.find((device) => {
        if (!activeAddress.value) return false
        return device.addresses[0].address.equals(activeAddress.value)
      })
    }

    watch((activeAddress), async (newActiveAddress, oldActiveAddress) => {
      if (!newActiveAddress) return
      if (oldActiveAddress && newActiveAddress.equals(oldActiveAddress)) return
      const device = await selectedDevice()
      if (!device) return
      name.value = device.name
    }, { immediate: true })

    const handleSubmit = async () => {
      const device = await selectedDevice()
      const devices = await allDevices()
      if (!devices || !device || !activeNetwork.value) return
      const idx = devices.findIndex((d) => {
        return d.addresses[0].address.equals(device.addresses[0].address)
      })
      if (idx < 0) return

      await saveDeviceName(idx, activeNetwork.value, name.value)
      fetch()
      deviceRenamed()
    }

    return { name, handleSubmit }
  }
})

export default WalletDeviceEditName
</script>
