<template>
  <div class="flex flex-row text-rGrayMed">
    <div class="flex flex-row flex-1 items-center">
      <div v-if="isRecipient" class="flex flex-row items-center w-24">
        <img src="@/assets/receiveTokens.svg" alt="receive tokens" class="w-6 h-auto" />
        <span class="ml-2 text-sm">{{ $t('history.receivedAction') }}</span>
      </div>
      <div v-else class="flex flex-row items-center w-24">
        <img src="@/assets/sendTokens.svg" alt="send tokens" class="w-6 h-auto" />
        <span class="ml-2 text-sm">{{ $t('history.sentAction') }}</span>
      </div>
      <div>
        <big-amount :amount="action.amount" class="text-rBlack text-base"/>
        <a :href="tokenExplorerUrl" target="_blank">
          {{ ` ${this.action.rri.name.toUpperCase()}` }}
        </a>
      </div>
    </div>
    <div class="flex flex-col items-end">
      <div v-if="!isRecipient" class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.toLabel') }}:</span> <span class="ml-2 mr-1 min-w-0 font-mono">{{ displayAddress(action.to_account) }}</span>
        <click-to-copy :address="action.to_account.toString()" />
      </div>
      <div v-if="isRecipient" class="flex flex-row flex-1 min-w-0">
        <span>{{ $t('history.fromLabel') }}:</span> <span class="ml-2 mr-1 min-w-0 font-mono">{{displayAddress(action.from_account) }}</span>
        <click-to-copy :address="action.from_account.toString()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ExecutedTransferTokensAction, AccountAddressT } from '@radixdlt/application'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { formatWalletAddressForDisplay } from '@/helpers/formatter'
import BigAmount from '@/components/BigAmount.vue'

const ActionListItemTransferTokens = defineComponent({
  components: {
    BigAmount,
    ClickToCopy
  },

  props: {
    action: {
      type: Object as PropType<ExecutedTransferTokensAction>,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    explorerUrlBase: {
      type: String,
      required: true
    }
  },

  computed: {
    isRecipient (): boolean {
      if (!this.activeAddress) return false
      return this.action.to_account.equals(this.activeAddress)
    },
    tokenExplorerUrl (): string {
      return `${this.explorerUrlBase}/#/tokens/${this.action.rri.toString()}`
    }
  },

  methods: {
    displayAddress (address: AccountAddressT): string {
      return formatWalletAddressForDisplay(address)
    }
  }
})

export default ActionListItemTransferTokens
</script>
