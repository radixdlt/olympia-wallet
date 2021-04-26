import { AccountAddress, AccountAddressT } from '@radixdlt/account'
import { Amount, AmountT, Denomination, DenominationOutputFormat } from '@radixdlt/primitives'
import { Token } from '@radixdlt/application/src/dto/_types'
import BigNumber from 'bignumber.js'

export const safelyUnwrapAddress = (addressString: string): AccountAddressT | null => {
  const recipientAddressResult = AccountAddress.fromUnsafe(addressString)
  if (recipientAddressResult.isErr()) {
    // console.log(`Invalid addres string, error: ${recipientAddressResult.error.message}`)
    return null
  }
  return recipientAddressResult.value
}

export const safelyUnwrapAmount = (amount: number): AmountT | null => {
  // let amountInput = amount
  // console.log('input', amount)
  // if (amount <= 0) {
  //   const bigN = new BigNumber(amount).toFixed(18)
  //   amountInput = 1_000_000_000_000_000 * Number(bigN) // 0.0123 -> 0.012300000000000000
  //   console.log(amountInput)
  // }
  // const denomination = amount < 0 ? Denomination.Atto : Denomination.Whole

  const amountInput = amount * 1000000000000000000
  const amountResult = Amount.fromUnsafe(String(amountInput), Denomination.Atto)
  // returns error Error: Invalid character at assert
  if (amountResult && amountResult.isErr()) {
    console.log('Invalid amount string, did you input a number?')
    return null
  }

  console.log('input', amount, amountInput, amountResult.value.toString())

  return amountResult ? amountResult.value : null
}

export const validateAmountOfType = (amount: AmountT, token: Token): boolean =>
  amount.isMultipleOf(token.granularity)

export const validateGreaterThanZero = (amount: AmountT): boolean => {
  const zero = Amount.fromUnsafe(0)._unsafeUnwrap()
  return amount.greaterThan(zero)
}
