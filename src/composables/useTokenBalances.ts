import { computed, ref, Ref } from 'vue'
import { AccountAddressT, Radix, ResourceIdentifierT, Token } from '@radixdlt/application'
import { firstValueFrom, interval, Subscription } from 'rxjs'
import { AccountBalancesEndpoint } from '@radixdlt/application/dist/api/open-api/_types'

const relatedTokens: Ref<Token[]> = ref([])
const tokenBalances: Ref<AccountBalancesEndpoint.DecodedResponse | null> = ref(null)

export default function useTokenBalances (radix: ReturnType<typeof Radix.create>) {
  let tokenBalancesSub: Subscription | null

  const fetchBalancesForAddress = async (address: AccountAddressT) => {
    // Unsubscribe from previous tokenBalancesSub
    tokenBalancesSub && tokenBalancesSub.unsubscribe()

    // Fetch token balances for address
    const res = await firstValueFrom(radix.ledger.tokenBalancesForAddress(address))
    tokenBalances.value = res

    // Initiate polling every 15 seconds for balance updates
    tokenBalancesSub = interval(15 * 1_000).subscribe(() => fetchBalancesForAddress(address))

    // Get token info for tokens related to this account and save in memory
    // Don't save duplicates
    res.account_balances.liquid_balances.map((balance) => {
      if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
        firstValueFrom(radix.ledger.tokenInfo(balance.token_identifier.rri))
          .then((t) => {
            if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
              relatedTokens.value = [...relatedTokens.value, t]
            }
          })
      }
    })
    return tokenBalances
  }

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
      tokenBalancesSub && tokenBalancesSub.unsubscribe()
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
    },
    filterHiddenTokens: (hiddenTokens: string[]) => {
      if (!tokenBalances.value) return hiddenTokens
      const listOfLiquidBalanceRRIs: Array<string> = tokenBalances.value.account_balances.liquid_balances.map((lb) => lb.token_identifier.rri.toString())
      const newList = hiddenTokens.filter(rri => listOfLiquidBalanceRRIs.includes(rri))
      return newList
    },

    fetchBalancesForAddress
  }
}
