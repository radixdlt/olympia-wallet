<template>
  <div class="bg-rGrayLightest p-5 flex-1 overflow-y-scroll">
    <div class="flex flex-col">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeForm == 'password'" @click="() => handleClickTab('password')">Reset Password</tabs-tab>
        <tabs-tab :isActive="activeForm == 'pin'" @click="() => handleClickTab('pin')">Reset PIN</tabs-tab>
        <tabs-tab :isActive="activeForm == 'mnemonic'" @click="() => handleClickTab('mnemonic')">Reveal Seed Phrase</tabs-tab>
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
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { Radix, mockedAPI } from '@radixdlt/application'
import { combineLatest, Subject, Subscription } from 'rxjs'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'
import SettingsRevealMnemonic from './SettingsRevealMnemonic.vue'
import SettingsResetPassword from './SettingsResetPassword.vue'
import { useStore } from '@/store'
import { MnemomicT } from '@radixdlt/account'
import { ref } from '@nopr3d/vue-next-rx'

const SettingsIndex = defineComponent({
  components: {
    SettingsResetPassword,
    SettingsResetPin,
    SettingsRevealMnemonic,
    TabsContent,
    TabsTab
  },

  setup () {
    const store = useStore()
    const radix = Radix
      .create()
      .__withAPI(mockedAPI)
      .withWallet(store.state.wallet)

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

    onUnmounted(() => subs.unsubscribe())

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
