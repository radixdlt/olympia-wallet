import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { WalletT } from '@radixdlt/application'

declare module '@vue/runtime-core' {
  interface State {
    wallet: WalletT
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}