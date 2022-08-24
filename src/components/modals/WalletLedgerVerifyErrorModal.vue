<template>
  <div class="fixed w-screen h-screen z-20 flex items-center justify-center bg-translucent-black left-0 top-0">
    <div class="bg-white rounded-md py-7 px-7 w-full max-w-3xl absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <h3 class="font-medium text-rBlack mb-2 w-full">Verify Hardware Wallet Address</h3>
      <div>
        <div class="text-rBlack">
          {{$t('hardware.disclaimer')}}
        </div>
        <div class="text-center pt-4">
          <ButtonSubmit
            @click="setLedgerVerifyWrongAccount(false)"
            class="w-72 mx-auto mt-2"
            :disabled="false"
          >
            {{ $t('hardware.buttonDone') }}
          </ButtonSubmit>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useWallet } from '@/composables'
import { useRouter } from 'vue-router'
import { Network } from '@radixdlt/primitives'

const WalletLedgerVerifyAddressModal = defineComponent({
  components: {
    ButtonSubmit
  },

  setup () {
    const router = useRouter()
    const { activeAddress, activeNetwork, setLedgerVerifyWrongAccount } = useWallet(router)
    const isMainnet: ComputedRef<boolean> = computed(() => activeNetwork.value === Network.MAINNET)

    return {
      activeAddress,
      isMainnet,
      setLedgerVerifyWrongAccount
    }
  }
})

export default WalletLedgerVerifyAddressModal
</script>
