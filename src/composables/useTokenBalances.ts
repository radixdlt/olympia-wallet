import { ref, Ref } from 'vue'
import { Radix, Token } from '@radixdlt/application'
import { mergeMap } from 'rxjs/operators'
import { Observed } from '@/helpers/typeHelpers'

// interface useTokenBalancesInterface {
//   readonly tokenBalances: Ref<Observed<ReturnType<typeof radix.ledger.tokenBalancesForAddress> | null>;
//   tokenBalancesUnsub: () => void;
//   tokenBalanceFor: (token: Token) => AmountT | null;
// }

export default function useTokenBalances (radix: ReturnType<typeof Radix.create>) {
  const tokenBalances: Ref<Observed<ReturnType<typeof radix.ledger.tokenBalancesForAddress>> | null> = ref(null)
  const tokenBalancesSub = radix.activeAccount
    .pipe(
      mergeMap((account) => radix.ledger.tokenBalancesForAddress(account.address))
    ).subscribe((tokenBalancesRes) => {
      tokenBalances.value = tokenBalancesRes
    })

  return {
    tokenBalances,
    tokenBalancesUnsub: () => {
      tokenBalancesSub.unsubscribe()
    },

    tokenBalanceFor: (token: Token) => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.account_balances.liquid_balances.find((lb) => lb.token_identifier.rri.equals(token.rri)) || null
    }
  }
}
