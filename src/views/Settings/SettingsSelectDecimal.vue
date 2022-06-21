<template>
    <div class="bg-white flex flex-col w-full rounded-md">
        <div class="pt-6 px-6 pb-4">
            <div class="text-rGrayDark text-sm mb-7 w-full max-w-xl">
                <p>{{ $t('settings.changeRegionalDecimalLabel') }}</p>
                <div class="flex flex-row items-center gap-4 mb-8">
                    <div class="flex-grow">
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="decimalType === 'us'"
                            :disabled="decimalType !== 'us'"
                            class="mr-2 cursor-pointer"
                            @click="setDecimalType('us')"
                            />
                            <div class="flex gap-4">
                              <span>{{ $t('settings.usLabel') }}</span>
                              <span>{{ $t('settings.usLabelExample')}}</span>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <AppRadioIndicator
                            :enabled="decimalType === 'europe'"
                            :disabled="decimalType !== 'europe'"
                            class="mr-2 cursor-pointer"
                            @click="setDecimalType('europe')"
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
import { defineComponent } from 'vue'
import AppRadioIndicator from '@/components/AppRadioIndicator.vue'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'

export default defineComponent({
  components: { AppRadioIndicator },
  setup () {
    const router = useRouter()
    const { decimalType, setDecimalType } = useWallet(router)

    return {
      decimalType,
      setDecimalType
    }
  }
})
</script>
