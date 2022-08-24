import { AccountAddress, AccountAddressT, Amount, AmountT, Token, ValidatorAddress, ValidatorAddressT } from '@radixdlt/application'
import BigNumber from 'bignumber.js'

export const safelyUnwrapAddress = (addressString: string, preamble: string): AccountAddressT | null => {
  const recipientAddressResult = AccountAddress.fromUnsafe(addressString)
  const validAddressForActiveNetwork = preamble ? addressString.startsWith(preamble) : true

  if (recipientAddressResult.isErr() || !validAddressForActiveNetwork) {
    return null
  }
  return recipientAddressResult.value
}

export const safelyUnwrapValidator = (validatorString: string): ValidatorAddressT | null => {
  const validatorAddressRes = ValidatorAddress.fromUnsafe(validatorString)
  if (validatorAddressRes.isErr()) {
    return null
  }
  return validatorAddressRes.value
}

export const safelyUnwrapAmount = (amount: string): AmountT | null => {
  const bigAmount = new BigNumber(amount)
  const amountInput = bigAmount.shiftedBy(18) // Atto
  const amountResult = Amount.fromUnsafe(amountInput.toFixed())
  if (amountResult && amountResult.isErr()) {
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
