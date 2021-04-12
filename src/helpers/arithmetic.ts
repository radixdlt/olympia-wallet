import { AmountT } from '@radixdlt/primitives'
import { Result } from 'neverthrow'

export const add = (lhs: AmountT, rhs: AmountT): Result<AmountT, Error> => lhs.adding(rhs)

export const subtract = (lhs: AmountT, rhs: AmountT): Result<AmountT, Error> => lhs.subtracting(rhs)

export const sumAmounts = (amounts: AmountT[]): AmountT | null =>
  amounts.reduce((accum: AmountT | null, a: AmountT) => {
    if (accum) {
      const res = add(accum, a)
      return res.isOk() ? res.value : accum
    } else return a
  }, null)
