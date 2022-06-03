<template>
  <wallet-ledger-verify-decrypt-modal v-if="shouldShowDecryptModal" />
  <div class="flex flex-col flex-1 min-w-0 overflow-y-auto bg-white">
    <div class="bg-rGrayLightest py-6 px-8 bg-gray">
      <div class="flex justify-between">
        <h3 class="font-medium text-rBlack">{{ $t('history.historyHeading') }}</h3>
        <div class="flex items-center text-rBlack text-sm">
          <span class="text-rGrayDark mr-2">{{ $t('wallet.currentAddress') }}</span> <span class="font-mono text-rBlack">{{ activeAddress.toString() }}</span>
          <div class="hover:text-rGreen flex flex-row items-center cursor-pointer transition-colors">
            <click-to-copy
              :address="activeAddress.toString()"
              :checkForHardwareAddress=true
              @verifyHardwareAddress="verifyHardwareWalletAddress"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="text-rBlack py-6 min-h-full text-sm">
      <div v-if="loadingHistory || !nativeToken" class="p-4 flex items-center justify-center">
        <loading-icon class="text-rGrayDark" />
      </div>
      <template v-else-if="transactionsWithMessages.length > 0">
        <div>
          <!-- <transaction-list-item
            v-for="(txn, i) in pendingTransactions"
            :key="i"
            :transaction="txn"
            :index="i"
            :activeAddress="activeAddress"
            :pending="true"
            :nativeToken="nativeToken"
            :explorerUrlBase="explorerUrlBase"
          /> -->

          <transaction-list-item
            v-for="(txn, i) in transactionsWithMessages"
            :key="i"
            :transaction="txn.tx"
            :decryptedMessage="txn.decryptedMessage"
            :index="i"
            :activeAddress="activeAddress"
            :pending="false"
            :nativeToken="nativeToken"
            :explorerUrlBase="explorerUrlBase"
            @decryptMessage="activateThenDecrypt"
          />
        </div>

        <div class="flex flex-row items-center text-rGrayDark justify-between py-5 px-8">
          <button v-if="canGoBack" @click="previousPage" class="flex flex-row items-center hover:text-rGreen transition-colors">
            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
              <g clip-path="url(#clip0)">
              <path d="M9.95508 14.7568L4.83414 9.6359L9.95508 4.51496" class="stroke-current" stroke-miterlimit="10"/>
              <path d="M4.83451 9.63627L15.1655 9.63622" class="stroke-current" stroke-miterlimit="10"/>
              </g>
              <defs>
              <clipPath id="clip0">
              <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
              </clipPath>
              </defs>
            </svg>
            <span>{{ $t('history.previous') }}</span>
          </button>
          <div v-else></div>
          <button v-if="canGoNext" @click="nextPage" class="flex flex-row items-center hover:text-rGreen">
            <span class="mr-3">{{ $t('history.next') }}</span>
            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0)">
              <path d="M10.0449 5.24316L15.1659 10.3641L10.0449 15.485" class="stroke-current" stroke-miterlimit="10"/>
              <path d="M15.1655 10.3637L4.83446 10.3638" class="stroke-current" stroke-miterlimit="10"/>
              </g>
              <defs>
              <clipPath id="clip0">
              <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
              </clipPath>
              </defs>
            </svg>
          </button>
          <div v-else></div>
        </div>
      </template>
      <div v-else class="px-8 text-base">
        {{ $t('history.noHistory') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, watch } from 'vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { useWallet, useHistory } from '@/composables'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import WalletLedgerVerifyDecryptModal from './WalletLedgerVerifyDecryptModal.vue'
import { ExecutedTransaction } from '@radixdlt/application'

const WalletHistory = defineComponent({
  components: {
    LoadingIcon,
    ClickToCopy,
    TransactionListItem,
    WalletLedgerVerifyDecryptModal
  },

  setup () {
    const router = useRouter()
    const {
      activeAddress,
      activateAccount,
      explorerUrlBase,
      hardwareAccount,
      nativeToken,
      hardwareError,
      radix,
      verifyHardwareWalletAddress
    } = useWallet(router)

    if (!activeAddress.value) {
      return
    }

    const {
      canGoBack,
      canGoNext,
      decryptedMessages,
      fetchTransactions,
      loadingHistory,
      transactions,
      decryptMessage,
      leavingHistory,
      nextPage,
      previousPage,
      resetHistory,
      updateActiveAccount,
      isDecrypting
    } = useHistory(radix, activeAddress.value)

    const transactionsWithMessages = computed(() => {
      return transactions.value.map((tx) => {
        const msg = decryptedMessages.value.find((msg) => msg.id === tx.txID.toString())
        return !msg ? { tx } : {
          tx,
          decryptedMessage: msg.message
        }
      })
    })

    const shouldShowDecryptModal: ComputedRef<boolean> = computed(() =>
      isDecrypting.value && !!activeAddress.value && !!hardwareAccount.value && activeAddress.value === hardwareAccount.value.address
    )

    const activateThenDecrypt = async (data: ExecutedTransaction) => {
      activateAccount((client) => {
        decryptMessage(client, data)
      }).catch((e) => {
        if (!activeAddress.value) return
        updateActiveAccount(activeAddress.value)
        resetHistory()
        fetchTransactions()
      })
    }

    // Fetch new history when active account changes
    watch((activeAddress), (newAddress, oldAddress) => {
      if (!newAddress) return
      if (newAddress && oldAddress && !newAddress.equals(oldAddress)) {
        leavingHistory()
        updateActiveAccount(newAddress)
      }
      if (newAddress && oldAddress && newAddress.equals(oldAddress)) {
        return
      }
      resetHistory()
      fetchTransactions()
    }, { immediate: true })

    // Fetch initial history on route load
    onMounted(() => {
      resetHistory()
    })

    onBeforeRouteLeave(() => {
      leavingHistory()
    })

    return {
      activeAddress,
      activateThenDecrypt,
      canGoBack,
      canGoNext,
      decryptMessage,
      explorerUrlBase,
      decryptedMessages,
      loadingHistory,
      nativeToken,
      nextPage,
      hardwareError,
      previousPage,
      resetHistory,
      shouldShowDecryptModal,
      transactionsWithMessages,
      verifyHardwareWalletAddress
    }
  }
})

export default WalletHistory
</script>
