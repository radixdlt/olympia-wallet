import { defineRule, configure } from 'vee-validate'
import { required, confirmed, length, max } from '@vee-validate/rules'
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

    if (context.rule) {
      return i18n.global.t(`validations.${context.rule.name}`, { field: field, params: context.rule.params })
    }
    return i18n.global.t('validations.default', { field: field })
  }
})

defineRule('required', required)
defineRule('confirmed', confirmed)
defineRule('length', length)
defineRule('max', max)

defineRule('insufficientFunds', (value: number, [max]: [string]) => {
  return value <= Number(max)
})

defineRule('validAddress', (addressString: string, [preamble]: [string]) => {
  const safeAddress = safelyUnwrapAddress(addressString, preamble)
  return !!safeAddress
})

defineRule('validValidator', (validatorString: string) => {
  const safeAddress = safelyUnwrapValidator(validatorString)
  return !!safeAddress
})

defineRule('validAmount', (amountString: string) => {
  const amountMatch = /^\d*\.?\d*$/
  const amount = Number(amountString)
  if (amount && amountString.match(amountMatch)) {
    const safeAmount = safelyUnwrapAmount(amountString)
    return !!safeAmount
  }
  return false
})
