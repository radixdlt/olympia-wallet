import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { IdentityManagerT } from '@radixdlt/application'

declare module '@vue/runtime-core' {
  interface State {
    identityManager: IdentityManagerT
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}