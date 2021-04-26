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

export const validateAmountOfType = (amount: AmountT, token: Token): boolean =>
  amount.isMultipleOf(token.granularity)

export const validateGreaterThanZero = (amount: AmountT): boolean => {
  const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
  return amount.greaterThan(zero)
}
