<template>
    <div class="bg-white flex flex-col rounded-md w-full mb-72">
        <div class="pt-6 px-6 pb-4 rounded-md">
            <div class=" flex flex-col text-rGrayDark text-sm gap-4">
                <p>{{ $t('settings.changeRegionalDecimalLabel') }}</p>
                <div class="flex flex-row items-center gap-4 mb-8">
                    <div class="flex flex-col gap-4 w-full">
                        <div class="flex items-center w-full">
                          <AppRadioIndicator
                            :enabled="decimalType === 'us'"
                            :disabled="decimalType !== 'us'"
                            class="mr-2 cursor-pointer "
                            @click="setDecimalType('us')"
                            />
                          <span >{{ $t('settings.usLabel') }}</span>
                          <div class="flex gap-4 w-5/6 ml-20">
                            <span class="">{{ $t('settings.usLabelExample')}}</span>
                          </div>
                        </div>
                        <div class="flex items-center">
                          <AppRadioIndicator
                          :enabled="decimalType === 'europe'"
                          :disabled="decimalType !== 'europe'"
                          class="mr-2 cursor-pointer"
                          @click="setDecimalType('europe')"
                          />
                          <span class="mr-2">{{ $t('settings.europeLabel') }}</span>
                          <div class="flex gap-4 w-5/6 ml-11">
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
