import { computed, ref, Ref } from 'vue'
import { AccountAddressT, Radix, ResourceIdentifierT, Token } from '@radixdlt/application'
import { firstValueFrom } from 'rxjs'
import { AccountBalancesEndpoint } from '@radixdlt/application/dist/api/open-api/_types'

const relatedTokens: Ref<Token[]> = ref([])
const tokenBalances: Ref<AccountBalancesEndpoint.DecodedResponse | null> = ref(null)

const gatherRelevantTokens = async (radix: ReturnType<typeof Radix.create>, balances: AccountBalancesEndpoint.DecodedResponse) => {
  const relatedTokenPromises: Promise<any>[] = []
  balances.account_balances.liquid_balances.map((balance) => {
    if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
      relatedTokenPromises.push(
        firstValueFrom(radix.ledger.tokenInfo(balance.token_identifier.rri))
          .then((t) => {
            if (!relatedTokens.value.find((t) => t.rri.equals(balance.token_identifier.rri))) {
              relatedTokens.value = [...relatedTokens.value, t]
            }
          })
      )
    }
  })
  return await Promise.all(relatedTokenPromises)
}

export default function useTokenBalances (radix: ReturnType<typeof Radix.create>) {
  const fetchBalancesForAddress = async (address: AccountAddressT) => {
    // Unsubscribe from previous tokenBalancesSub

    // Fetch token balances for address
    const res = await firstValueFrom(radix.ledger.tokenBalancesForAddress(address))
    tokenBalances.value = res

    await gatherRelevantTokens(radix, res)
  }

  return {
    tokenBalances: computed(() => tokenBalances.value),
    relatedTokens: computed(() => relatedTokens.value),
    gatherRelevantTokens,
    loadingRelatedTokens: computed(() => {
      if (!tokenBalances.value || !relatedTokens.value) return false
      // All liquid_balances must have a corresponding relatedToken info entry
      return !tokenBalances.value.account_balances.liquid_balances
        .every((tb) => !!relatedTokens.value.find((rt) => rt.rri.equals(tb.token_identifier.rri)))
    }),

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

    fetchBalancesForAddress
  }
}
