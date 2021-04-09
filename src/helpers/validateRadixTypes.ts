import { Address, AddressT } from '@radixdlt/account'
import { Amount, AmountT, Denomination } from '@radixdlt/primitives'
import { Token } from '@radixdlt/application/src/dto/_types'

export const safelyUnwrapAddress = (addressString: string): AddressT | null => {
  const recipientAddressResult = Address.fromBase58String(addressString)
  if (recipientAddressResult.isErr()) {
    // console.log(`Invalid addres string, error: ${recipientAddressResult.error.message}`)
    return null
  }
  return recipientAddressResult.value
}

export const safelyUnwrapAmount = (amount: number): AmountT | null => {
  const amountResult = Amount.fromUnsafe(amount, Denomination.Whole)
  if (amountResult.isErr()) {
  //   console.log('Invalid amount string, did you input a number?')
    return null
  }
  return amountResult.value
}

export const validateAmountOfType = (amount: AmountT, token: Token): boolean => {
  if (!amount.isMultipleOf(token.granularity)) {
    // console.log('⚠️ requested amount to send is not a mulltiple of token granularity, will be unable to send')
    return false
  }
  return true
}
