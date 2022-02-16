import { computed, ref, Ref } from 'vue'
import { AccountT, Radix, ResourceIdentifierT, Token } from '@radixdlt/application'
// import { mergeMap } from 'rxjs/operators'
// import { Observed } from '@/helpers/typeHelpers'
import { firstValueFrom } from 'rxjs'
import { AccountBalancesEndpoint } from '@radixdlt/application/src/api/open-api/_types'
const tokenBalances: Ref<AccountBalancesEndpoint.DecodedResponse | null> = ref(null)

const relatedTokens: Ref<Token[]> = ref([])

export default function useTokenBalances (radix: ReturnType<typeof Radix.create>) {
  const fetchBalancesFor = async (account: AccountT) => {
    const tokenBalancesRes = await firstValueFrom(radix.ledger.tokenBalancesForAddress(account.address))
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
  }
  // const tokenBalancesSub = radix.activeAccount
  //   .pipe(
  //     mergeMap((account) => radix.ledger.tokenBalancesForAddress(account.address))
  //   ).subscribe((tokenBalancesRes) => {
  //     tokenBalances.value = tokenBalancesRes

  //     // Get token info for tokens related to this account and save in memory
  //     // Don't save duplicates
  //     tokenBalancesRes.account_balances.liquid_balances.map((balance) => {
  //       if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
  //         firstValueFrom(radix.ledger.tokenInfo(balance.token_identifier.rri))
  //           .then((t) => {
  //             if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
  //               relatedTokens.value = [...relatedTokens.value, t]
  //             }
  //           })
  //       }
  //     })
  //   })

  return {
    tokenBalances: computed(() => tokenBalances.value),
    relatedTokens: computed(() => relatedTokens.value),
    loadingRelatedTokens: computed(() => {
      if (!tokenBalances.value || !relatedTokens.value) return false
      // All liquid_balances must have a corresponding relatedToken info entry
      return !tokenBalances.value.account_balances.liquid_balances
        .every((tb) => !!relatedTokens.value.find((rt) => rt.rri.equals(tb.token_identifier.rri)))
    }),

    fetchBalancesFor,

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
