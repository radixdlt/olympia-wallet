import { createStore, useStore as baseUseStore } from 'vuex'
import { Store } from 'vuex/types'
import { InjectionKey } from 'vue'
import { IdentityManagerT } from '@radixdlt/application'

interface State {
  identityManager: IdentityManagerT | null;
}

// Create a new store instance.
export const store = createStore<State>({
  state () {
    return {
      wallet: null
    }
  },
  mutations: {
    setIdentityManager (state: State, IdentityManager: IdentityManagerT) {
      state.identityManager = IdentityManager
    }
  }
})

// define injection key
export const key: InjectionKey<Store<State>> = Symbol('key')

export function useStore () {
  return baseUseStore(key)
}
