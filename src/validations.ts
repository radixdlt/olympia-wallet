import { defineRule, configure } from 'vee-validate'
import { required, confirmed, length, max } from '@vee-validate/rules'
import { i18n } from '@/text'
import { safelyUnwrapAddress, safelyUnwrapAmount, safelyUnwrapValidator } from '@/helpers/validateRadixTypes'
import { AmountFormats } from './composables/useWallet'
import BigNumber from 'bignumber.js'

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
    if (field === 'password') {
      field = 'password'
    }

    if (field === 'pinConfirmation') {
      field = 'pin confirmation'
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

defineRule('insufficientFunds', (amountString: string, [max, preference]: [string, AmountFormats]) => {
  const bigMax = new BigNumber(max)
  const shiftedMax = bigMax.shiftedBy(-18) // Atto
  const valueAmount = safelyUnwrapAmount(amountString, preference)
  const maxAmount = safelyUnwrapAmount(shiftedMax.toFixed())
  if (!valueAmount || !maxAmount) return false
  return valueAmount?.compareTo(maxAmount) <= 0
})

defineRule('validAddress', (addressString: string, [preamble]: [string]) => {
  const safeAddress = safelyUnwrapAddress(addressString, preamble)
  return !!safeAddress
})

defineRule('validValidator', (validatorString: string) => {
  const safeAddress = safelyUnwrapValidator(validatorString)
  return !!safeAddress
})

defineRule('validAmount', (amountString: string, [preference]: [AmountFormats]) => {
  const safeAmount = safelyUnwrapAmount(amountString, preference)
  return !!safeAmount
})
