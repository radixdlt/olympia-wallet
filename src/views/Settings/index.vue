<template>
  <WalletLayout>
    <div class="bg-rGrayLightest p-5 flex-1 overflow-y-auto">
      <div class="flex flex-col">
        <div class="flex flex-row">
          <tabs-tab :isActive="activeTab === 'password'" @click="() => handleClickTab('password')" :isDisabled="!connected">{{ $t('settings.tabTitlePassword') }}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'pin'" @click="() => handleClickTab('pin')" :isDisabled="!connected">{{ $t('settings.tabTitlePin') }}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'mnemonic'" @click="() => handleClickTab('mnemonic')" :isDisabled="!connected">{{ $t('settings.tabTitleMnemonic') }}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'tokens'" @click="() => handleClickTab('tokens')">{{ $t('settings.tabTitleTokens') }}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'showAccounts'" @click="() => handleClickTab('showAccounts')">{{ $t('settings.tabTitleShowAccounts')}}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'nodes'" @click="() => handleClickTab('nodes')">{{ $t('settings.tabTitleGateway') }}</tabs-tab>
          <tabs-tab :isActive="activeTab === 'display'" @click="() => handleClickTab('display')">{{ $t('settings.tabTitleDisplay') }}</tabs-tab>
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
            <settings-tokens v-if="activeAddress" />
            <div
              v-else
              class="p-4 flex items-center justify-center"
            >
              <loading-icon class="text-rGrayDark" />
            </div>
          </template>
          <settings-select-node v-if="activeTab === 'nodes'" />
          <settings-select-decimal v-if="activeTab === 'display'" />
          <settings-show-accounts v-if="activeTab === 'showAccounts'"/>
        </tabs-content>
      </div>
    </div>
  </WalletLayout>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, watch } from 'vue'
import { MnemomicT } from '@radixdlt/application'
import { combineLatest, Subject, Subscription } from 'rxjs'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'
import SettingsRevealMnemonic from './SettingsRevealMnemonic.vue'
import SettingsResetPassword from './SettingsResetPassword.vue'
import SettingsSelectNode from './SettingsSelectNode.vue'
import SettingsTokens from './SettingsTokens.vue'
import SettingsSelectDecimal from './SettingsSelectDecimal.vue'
import SettingsShowAccounts from './SettingsShowAccounts.vue'
import WalletLayout from '@/components/layout/WalletLayout.vue'
import { Ref, ref } from '@nopr3d/vue-next-rx'
import { useSettingsTab, useWallet } from '@/composables'
import { useRoute, useRouter } from 'vue-router'
import LoadingIcon from '@/components/LoadingIcon.vue'

const SettingsIndex = defineComponent({
  components: {
    LoadingIcon,
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    SettingsSelectDecimal,
    SettingsSelectNode,
    SettingsShowAccounts,
    SettingsTokens,
    TabsContent,
    TabsTab,
    WalletLayout
  },

  setup () {
    const subs = new Subscription()
    const mnemonic: Ref<MnemomicT | null> = ref(null)
    const userRequestedMnemonic = new Subject<boolean>()
    const router = useRouter()
    const { connected, radix, activeAddress, setActiveAddress, showHideAccountModal } = useWallet(router)
    const { activeTab, setTab } = useSettingsTab()
    const route = useRoute()

    watch(
      () => route.params.activeAddress,
      (addr, oldAddr) => {
        if (!addr) return
        if (addr === oldAddr) return
        const id = Array.isArray(addr) ? addr[0] : addr
        setActiveAddress(id)
      },
      { immediate: true }
    )

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
      activeAddress,
      connected,
      mnemonic,
      handleAccessMnemonic,
      unsetMnemonic,
      handleClickTab,
      activeTab,
      setTab,
      showHideAccountModal
    }
  }
})

export default SettingsIndex
</script>
