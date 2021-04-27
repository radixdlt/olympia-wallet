import { AmountT } from '@radixdlt/primitives'

export const add = (lhs: AmountT, rhs: AmountT): AmountT => lhs.add(rhs)

export const subtract = (lhs: AmountT, rhs: AmountT): AmountT => lhs.sub(rhs)

export const sumAmounts = (amounts: AmountT[]): AmountT | null =>
  amounts.reduce((accum: AmountT | null, a: AmountT) => {
    if (accum) {
      return add(accum, a)
    } else return a
  }, null)
