<template>
  <span v-if="showMaxUnstakeText">
    {{ $t('staking.maxUnstakeCapitalized') }}
  </span>
  <span v-else class="relative inline-flex flex-col items-center group cursor-pointer" @click.stop="copyText">
    <span>{{numberForDisplay}}</span>
    <div class="absolute invisible group-hover:visible -mt-full bg-rGrayLightest text-rBlack bottom-full text-xs p-1 left-0 rounded-sm shadow border border-solid border-rGrayLight">
      {{fullNumber}}
    </div>
  </span>
</template>

<script lang="ts">
import { copyToClipboard } from '@/actions/vue/create-wallet'
import { defineComponent, PropType, computed, ComputedRef, toRef } from 'vue'
import { AmountT } from '@radixdlt/application'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import useWallet from '@/composables/useWallet'
import { asBigNumber } from '@/helpers/asBigNumber'
import { useRouter } from 'vue-router'

const BigAmount = defineComponent({
  props: {
    amount: {
      type: Object as PropType<AmountT>,
      required: true
    },
    showMaxUnstakeText: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  setup (props) {
    const toast = useToast()
    const { t } = useI18n({ useScope: 'global' })
    const router = useRouter()
    const { decimalType } = useWallet(router)
    const amount = toRef(props, 'amount')

    const numberForDisplay: ComputedRef<string> = computed(() => {
      if (!amount.value) return ''
      return asBigNumber(amount.value as AmountT, false, decimalType.value)
    })

    const fullNumber: ComputedRef<string> = computed(() => {
      if (!amount.value) return ''
      return asBigNumber(amount.value as AmountT, true, decimalType.value)
    })

    const copyText = () => {
      if (!amount.value) return
      const value = asBigNumber(amount.value as AmountT, true, decimalType.value).replaceAll(',', '')
      toast.success('Copied to Clipboard')
      copyToClipboard(value)
    }

    return { decimalType, numberForDisplay, fullNumber, copyText }
  }
})

export default BigAmount
</script>
