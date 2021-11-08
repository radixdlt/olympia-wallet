<template>
  <div class="bg-rGrayLightest p-5 flex-1 overflow-y-auto">
    <div class="flex flex-col">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeTab === 'password'" @click="() => handleClickTab('password')" :isDisabled="!connected">Change Password</tabs-tab>
        <tabs-tab :isActive="activeTab === 'pin'" @click="() => handleClickTab('pin')" :isDisabled="!connected">Change PIN</tabs-tab>
        <tabs-tab :isActive="activeTab === 'mnemonic'" @click="() => handleClickTab('mnemonic')" :isDisabled="!connected">Reveal Seed Phrase</tabs-tab>
        <tabs-tab :isActive="activeTab === 'tokens'" @click="() => handleClickTab('tokens')">Balances</tabs-tab>
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
        <template v-if="activeTab === 'tokens'">
          <div
            v-if="activeAccountIsLoading"
            class="p-4 flex items-center justify-center"
          >
            <loading-icon class="text-rGrayDark" />
          </div>
          <settings-tokens
            v-else
            :activeAccount="activeAccount"
          />
        </template>
        <settings-select-node
          v-if="activeTab === 'nodes'"
        />
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ComputedRef, computed } from 'vue'
import { MnemomicT } from '@radixdlt/application'
import { combineLatest, Subject, Subscription } from 'rxjs'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'
import SettingsRevealMnemonic from './SettingsRevealMnemonic.vue'
import SettingsResetPassword from './SettingsResetPassword.vue'
import SettingsSelectNode from './SettingsSelectNode.vue'
import SettingsTokens from './SettingsTokens.vue'
import { Ref, ref } from '@nopr3d/vue-next-rx'
import { useSettingsTab, useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import LoadingIcon from '@/components/LoadingIcon.vue'

const SettingsIndex = defineComponent({
  components: {
    LoadingIcon,
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    SettingsSelectNode,
    SettingsTokens,
    TabsContent,
    TabsTab
  },

  setup () {
    const subs = new Subscription()
    const mnemonic: Ref<MnemomicT | null> = ref(null)
    const userRequestedMnemonic = new Subject<boolean>()
    const router = useRouter()
    const { connected, radix, activeAccount } = useWallet(router)
    const { activeTab, setTab } = useSettingsTab()

    const activeAccountIsLoading: ComputedRef<boolean> = computed(() => !activeAccount.value)

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
      activeAccount,
      activeAccountIsLoading,
      connected,
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
