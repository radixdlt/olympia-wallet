import { ref, Ref } from 'vue'
import { RadixT, Token } from '@radixdlt/application'

interface useNativeTokenInterface {
  readonly nativeToken: Ref<Token | null>;
  nativeTokenUnsub: () => void;
}

export default function useNativeToken (radix: RadixT): useNativeTokenInterface {
  const nativeToken: Ref<Token | null> = ref(null)
  const nativeTokenSub = radix.ledger.nativeToken().subscribe((nativeTokenRes: Token) => {
    nativeToken.value = nativeTokenRes
  })

  return {
    nativeToken,
    nativeTokenUnsub: () => {
      nativeTokenSub.unsubscribe()
    }
  }
}
