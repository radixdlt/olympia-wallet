import { AccountAddress, AccountAddressT } from '@radixdlt/account'
import { Amount, AmountT } from '@radixdlt/primitives'
import { Token } from '@radixdlt/application/src/dto/_types'
import BigNumber from 'bignumber.js'
import { tokenBalancesErr } from '@radixdlt/application/src/errors'

export const safelyUnwrapAddress = (addressString: string): AccountAddressT | null => {
  const recipientAddressResult = AccountAddress.fromUnsafe(addressString)
  if (recipientAddressResult.isErr()) {
    // console.log(`Invalid addres string, error: ${recipientAddressResult.error.message}`)
    return null
  }
  return recipientAddressResult.value
}

export const safelyUnwrapAmount = (amount: number): AmountT | null => {
  const attoMultiplier = new BigNumber('1000000000000000000')
  const bigAmount = new BigNumber(amount)
  const amountInput = bigAmount.times(attoMultiplier)
  const amountResult = Amount.fromUnsafe(amountInput.toFixed())
  if (amountResult && amountResult.isErr()) {
    console.log('Invalid amount string, did you input a number?')
    return null
  }

  return amountResult ? amountResult.value : null
}

export const validateAmountOfType = (amount: AmountT, token: Token): boolean =>
  Amount.isAmountMultipleOf({
    amount: Amount.fromUnsafe(amount)._unsafeUnwrap(),
    granularity: Amount.fromUnsafe(token.granularity)._unsafeUnwrap()
  })

export const validateGreaterThanZero = (amount: AmountT): boolean => {
  const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
  return amount.gt(zero)
}
