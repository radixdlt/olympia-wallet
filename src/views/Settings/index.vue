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
          :radixConnectService="radixConnectService"
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
          :radixConnectService="radixConnectService"
        />
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType } from 'vue'
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
import RadixConnectService from '@/services/RadixConnectService'

const SettingsIndex = defineComponent({
  components: {
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    SettingsSelectNode,
    TabsContent,
    TabsTab
  },

  async setup (props) {
    onUnmounted(() => subs.unsubscribe())

    const store = useStore()
    await props.radixConnectService.establishConnection()
    const radix = props.radixConnectService.getRadixInstance()
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
  },

  props: {
    radixConnectService: {
      type: Object as PropType<RadixConnectService>,
      required: true
    }
  }
})

export default SettingsIndex
</script>
