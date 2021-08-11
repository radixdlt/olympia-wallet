<template>
  <div class="bg-rGrayLightest p-5 flex-1 overflow-y-auto">
    <div class="flex flex-col">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeForm == 'password'" @click="() => handleClickTab('password')">Change Password</tabs-tab>
        <tabs-tab :isActive="activeForm == 'pin'" @click="() => handleClickTab('pin')">Change PIN</tabs-tab>
        <tabs-tab :isActive="activeForm == 'mnemonic'" @click="() => handleClickTab('mnemonic')">Reveal Seed Phrase</tabs-tab>
        <tabs-tab :isActive="activeForm == 'nodes'" @click="() => handleClickTab('nodes')">Nodes</tabs-tab>
      </div>
      <tabs-content :leftTabIsActive="activeForm == 'password'">
        <settings-reset-password
          v-if="activeForm == 'password'"
        />
        <settings-reset-pin
          v-if="activeForm == 'pin'"
        />
        <settings-reveal-mnemonic
          v-if="activeForm == 'mnemonic'"
          @clickAccessMnemonic="handleAccessMnemonic"
          :mnemonic="mnemonic"
        />
         <settings-select-node
          v-if="activeForm == 'nodes'"
        />
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { MnemomicT, Network } from '@radixdlt/application'
import { combineLatest, Subject, Subscription } from 'rxjs'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'
import SettingsRevealMnemonic from './SettingsRevealMnemonic.vue'
import SettingsResetPassword from './SettingsResetPassword.vue'
import SettingsSelectNode from './SettingsSelectNode.vue'
import { useStore } from '@/store'
import { ref } from '@nopr3d/vue-next-rx'
import { radixConnection, setNetwork } from '@/helpers/network'

const SettingsIndex = defineComponent({
  components: {
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    SettingsSelectNode,
    TabsContent,
    TabsTab
  },

  async setup () {
    onUnmounted(() => subs.unsubscribe())

    const store = useStore()
    let radix = await radixConnection()
    radix = await setNetwork(radix, process.env.VUE_APP_NETWORK_NAME as Network)
    radix.__withWallet(store.state.wallet)

    const mnemonic = ref(null)
    const userRequestedMnemonic = new Subject<boolean>()

    const subs = new Subscription()

    // Only fetch mnemonic if user confirms pin
    const watchUserDidRequstMnemonic = combineLatest<[MnemomicT, boolean]>([radix.revealMnemonic(), userRequestedMnemonic])
      .subscribe(([m, didRequest]: [MnemomicT, boolean]) => {
        if (didRequest) { mnemonic.value = m }
      })
    subs.add(watchUserDidRequstMnemonic)

    const handleAccessMnemonic = () => userRequestedMnemonic.next(true)

    const unsetMnemonic = () => userRequestedMnemonic.next(false)

    return {
      mnemonic,
      handleAccessMnemonic,
      unsetMnemonic
    }
  },

  data () {
    return {
      activeForm: 'password'
    }
  },

  methods: {
    handleClickTab (tab: string) {
      if (tab !== 'mnemonic') {
        this.mnemonic = null
        this.unsetMnemonic()
      }
      this.activeForm = tab
    }
  }
})

export default SettingsIndex
</script>
