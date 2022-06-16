<template>
    <div class="bg-white flex flex-col w-full rounded-md">
        <div class="pt-6 px-6 pb-4">
            <div class="text-rGrayDark text-sm mb-7 w-full max-w-xl">
                <p>{{ $t('settings.changeRegionalDecimalLabel') }}</p>
                <div class="flex flex-row items-center gap-4 mb-8">
                    <div class="flex-grow">
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="isActive"
                            :disabled="loading"
                            class="mr-2 cursor-pointer"
                            />
                            <div class="flex gap-4">
                              <span>{{ $t('settings.usLabel') }}</span>
                              <span>example: 1,000,000.50</span>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="isActive"
                            :disabled="loading"
                            class="mr-2 cursor-pointer"
                            />
                            <div class="">
                              <span class="mr-4">{{ $t('settings.europeLabel') }}</span>
                              <span>example: 1.000.000,50</span>
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

//state to toggle which radio is selected
const isSelected: Ref<boolean> = ref(false)

const handleSelectDecimalDisplay = () => {
  isSelected.value = true
}

export default defineComponent({
  components: { AppRadioIndicator },
  setup () {
    return {
      isSelected
    }
  }
})
</script>
