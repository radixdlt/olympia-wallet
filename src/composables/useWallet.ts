import { ref, computed, Ref, ComputedRef } from 'vue'
import { RadixT, WalletErrorCause, ErrorT, WalletT } from '@radixdlt/application'
import { Router } from 'vue-router'
import { filter } from 'rxjs/operators'
import { touchKeystore, hasKeystore } from '@/actions/vue/create-wallet'
import { resetStore } from '@/actions/vue/data-store'

const hasWallet = ref(false)
const wallet: Ref<WalletT | null> = ref(null)

interface useWalletInterface {
  hasWallet: ComputedRef<boolean>;
  invalidPasswordError: ComputedRef<ErrorT<'wallet'> | null>;

  loginWithWallet: (password: string) => Promise<RadixT>;
  resetWallet: (nextRoute: 'create-wallet' | 'restore-wallet') => void;
}

export default function useWallet (radix: RadixT, router: Router): useWalletInterface {
  const invalidPasswordError: Ref<ErrorT<'wallet'> | null> = ref(null)

  radix.errors
    .pipe(filter(errorNotification => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
    .subscribe((errorNotification: ErrorT<'wallet'>) => { invalidPasswordError.value = errorNotification })

  radix.__wallet.subscribe((newWallet: WalletT) => {
    wallet.value = newWallet
    router.push('/wallet')
  })

  hasKeystore().then((res: boolean) => { console.log(res); hasWallet.value = res })

  return {
    hasWallet: computed(() => hasWallet.value),
    invalidPasswordError: computed(() => invalidPasswordError.value),

    async loginWithWallet (password: string) {
      return radix.login(password, touchKeystore)
    },

    resetWallet: (nextRoute = 'create-wallet') => {
      hasWallet.value = false
      resetStore()
      router.push(`/${nextRoute}`)
    }
  }
}
