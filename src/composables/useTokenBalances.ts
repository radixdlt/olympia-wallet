import { computed, ref, Ref } from 'vue'
import { AccountT, Radix, ResourceIdentifierT, Token } from '@radixdlt/application'
import { filter, mergeMap } from 'rxjs/operators'
import { Observed } from '@/helpers/typeHelpers'
import { firstValueFrom, Subject } from 'rxjs'

const relatedTokens: Ref<Token[]> = ref([])

// We're passing an optional arg accountSub since in some cases it's not necessary to have a Subject Account, but
// cases where we need the latest account such as in WalletOverview we should take in a specific AccountSub as arg.
export default function useTokenBalances (radix: ReturnType<typeof Radix.create>, accountSub: Subject<AccountT | null> = new Subject()) {
  const tokenBalances: Ref<Observed<ReturnType<typeof radix.ledger.tokenBalancesForAddress>> | null> = ref(null)

  // using isNonNull to specifically filter out every null value from tokenBalancesSub
  function isNonNull<T> (value: T): value is NonNullable<T> {
    return value != null
  }
  const tokenBalancesSub = accountSub.asObservable()
    .pipe(
      filter(isNonNull),
      mergeMap((account) => radix.ledger.tokenBalancesForAddress(account.address))
    )
    .subscribe((tokenBalancesRes) => {
      tokenBalances.value = tokenBalancesRes

      // Get token info for tokens related to this account and save in memory
      // Don't save duplicates
      tokenBalancesRes.account_balances.liquid_balances.map((balance) => {
        if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
          firstValueFrom(radix.ledger.tokenInfo(balance.token_identifier.rri))
            .then((t) => {
              if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
                relatedTokens.value = [...relatedTokens.value, t]
              }
            })
        }
      })
    })

  return {
    tokenBalances: computed(() => tokenBalances.value),
    relatedTokens: computed(() => relatedTokens.value),
    loadingRelatedTokens: computed(() => {
      if (!tokenBalances.value || !relatedTokens.value) return false
      // All liquid_balances must have a corresponding relatedToken info entry
      return !tokenBalances.value.account_balances.liquid_balances
        .every((tb) => !!relatedTokens.value.find((rt) => rt.rri.equals(tb.token_identifier.rri)))
    }),

    tokenBalancesUnsub: () => {
      tokenBalancesSub.unsubscribe()
    },
    tokenBalanceFor: (token: Token) => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.account_balances.liquid_balances.find((lb) => lb.token_identifier.rri.equals(token.rri)) || null
    },
    tokenBalanceForByString: (rri: string) => {
      if (!tokenBalances.value) return null
      return tokenBalances.value.account_balances.liquid_balances.find((lb) => lb.token_identifier.rri.toString() === rri) || null
    },
    tokenInfoFor: (rri: ResourceIdentifierT) => {
      if (!relatedTokens.value) return null
      return relatedTokens.value.find((rt) => rt.rri.equals(rri)) || null
    }
  }
}
