import { createStore, useStore as baseUseStore } from 'vuex'
import { Store } from 'vuex/types'
import { InjectionKey } from 'vue'
import { WalletT } from '@radixdlt/account'

interface State {
  wallet: WalletT | null;
}

// Create a new store instance.
export const store = createStore<State>({
  state () {
    return {
      wallet: null
    }
  },
  mutations: {
    setWallet (state: State, wallet: WalletT) {
      state.wallet = wallet
    }
  }
})

// define injection key
export const key: InjectionKey<Store<State>> = Symbol('key')

export function useStore () {
  return baseUseStore(key)
}
