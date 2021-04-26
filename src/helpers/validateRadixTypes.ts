import { AccountAddress, AccountAddressT } from '@radixdlt/account'
import { Amount, AmountT, Denomination } from '@radixdlt/primitives'
import { Token } from '@radixdlt/application/src/dto/_types'

export const safelyUnwrapAddress = (addressString: string): AccountAddressT | null => {
  const recipientAddressResult = AccountAddress.fromUnsafe(addressString)
  if (recipientAddressResult.isErr()) {
    // console.log(`Invalid addres string, error: ${recipientAddressResult.error.message}`)
    return null
  }
  return recipientAddressResult.value
}

export const safelyUnwrapAmount = (amount: number): AmountT | null => {
  const amountResult = Amount.fromUnsafe(amount)
  if (amountResult.isErr()) {
    console.log('Invalid amount string, did you input a number?')
    return null
  }
  console.log('amountResult', amountResult)
  return amountResult.value
}

// Validate amount is multiple of token granularity
// Fails with this error ->
// runtime-core.esm-bundler.js?5c40:217 Uncaught TypeError: Cannot read property 'magnitude' of undefined
// at Object.isMultipleOf (amount.js?bf59:49)
// at Object.exports.validateAmountOfType (validateRadixTypes.ts?4e64:25)
// at Proxy.handleSubmit (WalletTransaction.vue?2b9f:66)
// at eval (WalletTransaction.vue?956e:15)
// at eval (runtime-dom.esm-bundler.js?830f:1147)
// at callWithErrorHandling (runtime-core.esm-bundler.js?5c40:154)
// at callWithAsyncErrorHandling (runtime-core.esm-bundler.js?5c40:163)
// at HTMLFormElement.invoker (runtime-dom.esm-bundler.js?830f:333)
export const validateAmountOfType = (amount: AmountT, token: Token): boolean =>
  amount.isMultipleOf(token.granularity)
