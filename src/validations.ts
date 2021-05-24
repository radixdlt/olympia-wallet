import { defineRule, configure } from 'vee-validate'
import { required, confirmed, length } from '@vee-validate/rules'
import { i18n } from '@/text'
import { safelyUnwrapAddress, safelyUnwrapAmount, safelyUnwrapValidator } from '@/helpers/validateRadixTypes'

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
    let field = context.field
    if (field === 'confirmation') {
      field = 'Passwords'
    }

    if (context.rule) return i18n.global.t(`validations.${context.rule.name}`, { field: field, params: context.rule.params })
    return i18n.global.t('validations.default', { field: field })
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

defineRule('validValidator', (validatorString: string) => {
  const safeAddress = safelyUnwrapValidator(validatorString)
  return !!safeAddress
})

defineRule('validAmount', (amountString: number) => {
  const safeAmount = safelyUnwrapAmount(Number(amountString))
  return !!safeAmount
})
