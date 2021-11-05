import { AppSelectOptionT } from '@/components/AppSelect.vue'
import { StrengthT } from '@radixdlt/application'

export const mnemonicStrengthOptions: AppSelectOptionT[] = [
  {
    id: StrengthT.WORD_COUNT_12,
    label: '12 word seed phrase'
  },
  {
    id: StrengthT.WORD_COUNT_18,
    label: '18 word seed phrase'
  },
  {
    id: StrengthT.WORD_COUNT_24,
    label: '24 word seed phrase'
  }
]
