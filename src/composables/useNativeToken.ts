import { ref, Ref } from 'vue'
import { Radix, Token } from '@radixdlt/application'
import { mergeMap } from 'rxjs/operators'

interface useNativeTokenInterface {
  readonly nativeToken: Ref<Token | null>;
  nativeTokenUnsub: () => void;
}

export default function useNativeToken (radix: ReturnType<typeof Radix.create>): useNativeTokenInterface {
  const nativeToken: Ref<Token | null> = ref(null)
  const nativeTokenSub =
  radix.ledger.networkId()
    .pipe(mergeMap((networkId: string) => radix.ledger.nativeToken(networkId)))
    .subscribe((nativeTokenRes) => {
      nativeToken.value = nativeTokenRes
    })

  return {
    nativeToken,
    nativeTokenUnsub: () => {
      nativeTokenSub.unsubscribe()
    }
  }
}
