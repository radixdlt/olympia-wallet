<template>
  <div class="bg-rGrayLightest p-5 flex-1 overflow-y-auto">
    <div class="flex flex-col">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeTab === 'password'" @click="() => handleClickTab('password')">Change Password</tabs-tab>
        <tabs-tab :isActive="activeTab === 'pin'" @click="() => handleClickTab('pin')">Change PIN</tabs-tab>
        <tabs-tab :isActive="activeTab === 'mnemonic'" @click="() => handleClickTab('mnemonic')">Reveal Seed Phrase</tabs-tab>
        <tabs-tab :isActive="activeTab === 'nodes'" @click="() => handleClickTab('nodes')">Choose Node/Network</tabs-tab>
      </div>
      <tabs-content :leftTabIsActive="activeTab === 'password'">
        <settings-reset-password
          v-if="activeTab === 'password'"
        />
        <settings-reset-pin
          v-if="activeTab === 'pin'"
        />
        <settings-reveal-mnemonic
          v-if="activeTab === 'mnemonic'"
          @clickAccessMnemonic="handleAccessMnemonic"
          :mnemonic="mnemonic"
        />
         <settings-select-node
          v-if="activeTab === 'nodes'"
        />
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { MnemomicT } from '@radixdlt/application'
import { combineLatest, Subject, Subscription } from 'rxjs'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'
import SettingsRevealMnemonic from './SettingsRevealMnemonic.vue'
import SettingsResetPassword from './SettingsResetPassword.vue'
import SettingsSelectNode from './SettingsSelectNode.vue'
import { Ref, ref } from '@nopr3d/vue-next-rx'
import { useSettingsTab, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
const SettingsIndex = defineComponent({
  components: {
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    SettingsSelectNode,
    TabsContent,
    TabsTab
  },

  setup () {
    const subs = new Subscription()
    const mnemonic: Ref<MnemomicT | null> = ref(null)
    const userRequestedMnemonic = new Subject<boolean>()
    const router = useRouter()
    const { radix } = useWallet(router)
    const { activeTab, setTab } = useSettingsTab()

    // Only fetch mnemonic if user confirms pin
    const watchUserDidRequstMnemonic = combineLatest<[MnemomicT, boolean]>([radix.revealMnemonic(), userRequestedMnemonic])
      .subscribe(([m, didRequest]: [MnemomicT, boolean]) => {
        if (didRequest) { mnemonic.value = m }
      })
    subs.add(watchUserDidRequstMnemonic)

    const handleAccessMnemonic = () => userRequestedMnemonic.next(true)

    const unsetMnemonic = () => userRequestedMnemonic.next(false)

    const handleClickTab = (tab: string) => {
      if (tab !== 'mnemonic') {
        mnemonic.value = null
        unsetMnemonic()
      }
      setTab(tab)
    }

    onUnmounted(() => subs.unsubscribe())

    return {
      mnemonic,
      handleAccessMnemonic,
      unsetMnemonic,
      handleClickTab,
      activeTab,
      setTab
    }
  }
})

export default SettingsIndex
</script>
