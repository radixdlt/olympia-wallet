import { Store } from 'vuex'
import { State } from './store'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

// Vuex@4.0.0-beta.1 is missing the typing for `useStore`. See https://github.com/vuejs/vuex/issues/1736
declare module 'vuex' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useStore<S = any>(injectKey?: InjectionKey<Store<S>> | string): Store<S>
  export function createStore<S>(options: StoreOptions<S>): Store<S>
}
