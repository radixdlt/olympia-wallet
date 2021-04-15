import { defineRule, configure } from 'vee-validate'
import { required, confirmed, length } from '@vee-validate/rules'
import { i18n } from '@/text'
import { safelyUnwrapAddress, safelyUnwrapAmount } from '@/helpers/validateRadixTypes'

interface FieldContext {
  field: string;
  value: unknown;
  form: Record<string, unknown>;
  rule?: {
      name: string;
      params?: Record<string, unknown> | unknown[];
  };
}

configure({
  generateMessage: (context: FieldContext) => {
    // Pass validation messages through i18n
    if (context.rule) return i18n.global.t(`validations.${context.rule.name}`, { field: context.field, params: context.rule.params })
    return i18n.global.t('validations.default', { field: context.field })
  }
})

defineRule('required', required)
defineRule('confirmed', confirmed)
defineRule('length', length)

defineRule('insufficientFunds', (value: number, [max]: [string]) => {
  return value <= Number(max)
})

defineRule('validAddress', (addressString: string) => {
  const safeAddress = safelyUnwrapAddress(addressString)
  return !!safeAddress
})

defineRule('validAmount', (amountString: number) => {
  const safeAmount = safelyUnwrapAmount(Number(amountString))
  return !!safeAmount
})
