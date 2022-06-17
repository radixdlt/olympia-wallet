<template>
    <div class="bg-white flex flex-col w-full rounded-md">
        <div class="pt-6 px-6 pb-4">
            <div class="text-rGrayDark text-sm mb-7 w-full max-w-xl">
                <p>{{ $t('settings.changeRegionalDecimalLabel') }}</p>
                <div class="flex flex-row items-center gap-4 mb-8">
                    <div class="flex-grow">
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="selectedDecimalType === 'us'"
                            :disabled="selectedDecimalType !== 'us'"
                            class="mr-2 cursor-pointer"
                            @click="handleSelectDecimal('us')"
                            />
                            <div class="flex gap-4">
                              <span>{{ $t('settings.usLabel') }}</span>
                              <span>{{ $t('settings.usLabelExample')}}</span>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="selectedDecimalType === 'europe'"
                            :disabled="selectedDecimalType !== 'europe'"
                            class="mr-2 cursor-pointer"
                            @click="handleSelectDecimal('europe')"
                            />
                            <div class="">
                              <span class="mr-4">{{ $t('settings.europeLabel') }}</span>
                              <span>{{ $t('settings.europeLabelExample')}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import { store } from '@/actions/electron/data-store'

// state to toggle which radio is selected
const selectedDecimalType: Ref<string> = ref('')

const handleSelectDecimal = (decimalType:string) => {
  selectedDecimalType.value = decimalType
  // send type to wallet.json
  // store.set('decimalType', decimalType)
}

export default defineComponent({
  components: { AppRadioIndicator },
  setup () {
    return {
      selectedDecimalType,
      handleSelectDecimal
    }
  }
})
</script>
