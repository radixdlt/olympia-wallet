<template>
  <div class="bg-rGrayLightest p-5 flex-1 overflow-y-scroll">
    <div class="flex flex-col">
      <div class="flex flex-row">
        <tabs-tab :isActive="activeForm = 'pin'" @click="activeForm = 'pin'">Reset PIN</tabs-tab>
      </div>
      <tabs-content :leftTabIsActive="activeForm == 'pin'">
        <settings-reset-pin v-if="activeForm == 'pin'"></settings-reset-pin>
      </tabs-content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TabsTab from '@/components/TabsTab.vue'
import TabsContent from '@/components/TabsContent.vue'
import SettingsResetPin from './SettingsResetPin.vue'

const SettingsIndex = defineComponent({
  components: {
    SettingsResetPin,
    TabsContent,
    TabsTab
  },

  data () {
    return {
      activeForm: 'pin'
    }
  }
})

export default SettingsIndex
</script>
