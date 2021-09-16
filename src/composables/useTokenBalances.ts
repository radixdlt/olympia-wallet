import { ref, Ref } from 'vue'
import { RadixT, Token, TokenBalance, TokenBalances } from '@radixdlt/application'

interface useTokenBalancesInterface {
  readonly tokenBalances: Ref<TokenBalances | null>;
  tokenBalancesUnsub: () => void;
  tokenBalanceFor: (token: Token) => TokenBalance | null;
}

export default function useTokenBalances (radix: RadixT): useTokenBalancesInterface {
  const tokenBalances: Ref<TokenBalances | null> = ref(null)
  const tokenBalancesSub = radix.tokenBalances.subscribe((tokenBalancesRes: TokenBalances) => {
    tokenBalances.value = tokenBalancesRes
  })

  return {
    tokenBalances,
    tokenBalancesUnsub: () => {
      tokenBalancesSub.unsubscribe()
    },

    tokenBalanceFor: (token: Token) => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.tokenBalances.find((tb: TokenBalance) => tb.token.rri.equals(token.rri)) || null
    }
  }
}
