import { createStore, useStore as baseUseStore } from 'vuex'
import { Store } from 'vuex/types'
import { InjectionKey } from 'vue'
import { WalletT } from '@radixdlt/account'

interface State {
  wallet: WalletT | null;
  count: number;
}

// Create a new store instance.
export const store = createStore<State>({
  state () {
    return {
      wallet: null,
      count: 0
    }
  },
  mutations: {
  }
})

// define injection key
export const key: InjectionKey<Store<State>> = Symbol('key')

export function useStore () {
  return baseUseStore(key)
}
