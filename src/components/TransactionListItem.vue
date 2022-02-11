<template>
  <div class="border border-rGray rounded-md flex flex-row mb-2 ml-12 mr-12">
    <div v-if="pending" class="bg-rGrayLightest text-rGrayDark text-sm pl-3 w-40 flex items-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
        <g clip-path="url(#clip0)">
        <path d="M6.81934 0V4" stroke="#003057" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M6.81934 10V14" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M2.70508 1.33691L5.05618 4.57291" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M8.58301 9.42676L10.9341 12.6628" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M0.162109 4.83691L3.96631 6.07291" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M9.67236 7.92676L13.4766 9.16276" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M0.162109 9.16276L3.96631 7.92676" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M9.67236 6.07291L13.4766 4.83691" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M2.70508 12.6628L5.05618 9.42676" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        <path d="M8.58301 4.57291L10.9341 1.33691" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
        </g>
        <defs>
        <clipPath id="clip0">
        <rect width="13.6388" height="14" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    </div>
    <div v-else class="bg-rGrayLightest text-rGrayDark text-sm pl-3 w-40 flex items-center">
      {{ sentAt }}
    </div>
    <div class="flex-1" v-if="nativeToken">
      <div class="py-3.5 px-3">
        <div v-for="(action, i) in relatedActions" :key="i">
          <action-list-item-stake-tokens
            v-if="action.type === 'StakeTokens'"
            :action="action"
            :index="i"
            :nativeToken="nativeToken"
            :explorerUrlBase="explorerUrlBase"
          />
          <action-list-item-unstake-tokens
            v-else-if="action.type === 'UnstakeTokens'"
            :action="action"
            :index="i"
            :nativeToken="nativeToken"
            :explorerUrlBase="explorerUrlBase"
          />
          <action-list-item-transfer-tokens
            v-else-if="action.type === 'TokenTransfer'"
            :action="action"
            :index="i"
            :activeAddress="activeAddress"
            :explorerUrlBase="explorerUrlBase"
          />
          <action-list-item-other
            v-else
            :action="action"
            :index="i"
            :activeAddress="activeAddress"
          />
        </div>
        <div class="text-rGrayMed">
          <span v-if="customTxnDisplayType === 'UNKNOWN'">{{ $t('history.unknownTransaction') }}</span>
          <span v-else-if="customTxnDisplayType === 'COMPLEX' && relatedActions.length !== transaction.actions.length">{{ $t('history.complexTransactionSomeUnrelated') }}</span>
          <span v-else-if="customTxnDisplayType === 'COMPLEX'">{{ $t('history.complexTransaction') }}</span>
        </div>
      </div>
      <div v-if="messageState" class="text-sm px-3 py-2 bg-rGrayLightest bg-opacity-60 flex items-center">
        <div class="h-5 w-6 flex items-center justify-center -ml-1 mr-1">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5" v-if="showMessageLock">
            <path d="M2.04883 4.93512V3.79987C2.04883 2.25355 3.30238 1 4.8487 1C6.39502 1 7.64857 2.25355 7.64857 3.79987V4.93512" stroke="#7A99AC" stroke-width="1.5" stroke-miterlimit="10"/>
            <path d="M1 11.4001V4.84473H2.13447H7.58739H8.72185V11.0556H2.60558" stroke="#7A99AC" stroke-width="1.5" stroke-miterlimit="10"/>
          </svg>

          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5" v-else>
            <path d="M15 5H5V11.1288H10.9545L13.3094 13.3889V11.1288H15V5Z" stroke="#7A99AC" stroke-miterlimit="10"/>
            <line x1="6.2002" y1="7" x2="13.7002" y2="7" stroke="#7A99AC"/>
            <line x1="6.2002" y1="9" x2="13.7002" y2="9" stroke="#7A99AC"/>
          </svg>
        </div>

        <span v-if="messageState == 'plaintext'" class="select-text">{{ transaction.message }}</span>
        <span v-if="messageState == 'decrypted'" class="select-text">{{decryptedMessage}}</span>
        <button v-if="messageState == 'encrypted'" class="text-rGreen underline hover:text-rGreenDark transition-colors" @click="decrypt">{{ $t('history.clickToDecryptLabel') }}</button>
      </div>
     </div>
    <div class="bg-rGrayLightest flex items-center justify-center px-3">
      <a :href="explorerUrl" target="_blank" class="w-6 h-6 rounded-full border border-rGray flex items-center justify-center cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.66797 3.60449H10.9101V10.8466" stroke="#7A99AC" stroke-miterlimit="10"/>
        <path d="M10.9096 3.60449L3.60449 10.9097" stroke="#7A99AC" stroke-miterlimit="10"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType } from 'vue'
import { ExecutedTransaction, AccountAddressT, Token, ExecutedAction, ActionType, Message } from '@radixdlt/application'
import { DateTime } from 'luxon'
import ActionListItemStakeTokens from '@/components/ActionListItemStakeTokens.vue'
import ActionListItemUnstakeTokens from '@/components/ActionListItemUnstakeTokens.vue'
import ActionListItemTransferTokens from '@/components/ActionListItemTransferTokens.vue'
import ActionListItemOther from '@/components/ActionListItemOther.vue'

export default defineComponent({
  components: {
    ActionListItemStakeTokens,
    ActionListItemTransferTokens,
    ActionListItemUnstakeTokens,
    ActionListItemOther
  },

  props: {
    transaction: {
      type: Object as PropType<ExecutedTransaction>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    activeAddress: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    pending: {
      type: Boolean,
      required: true
    },
    nativeToken: {
      type: Object as PropType<Token>,
      required: false
    },
    decryptedMessage: {
      type: String as PropType<string>,
      required: false,
      default: null
    },
    explorerUrlBase: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const explorerUrl: ComputedRef<string> = computed(() =>
      `${props.explorerUrlBase}/#/transactions/${props.transaction.txID}`
    )

    const relatedActions: ComputedRef<ExecutedAction[]> = computed(() => {
      return props.transaction.actions.filter((action: ExecutedAction) => {
        let related
        switch (action.type) {
          case ActionType.TOKEN_TRANSFER:
            related = action.to_account.equals(props.activeAddress) || action.from_account.equals(props.activeAddress)
            break
          case ActionType.STAKE_TOKENS:
            related = action.from_account.equals(props.activeAddress)
            break
          case ActionType.UNSTAKE_TOKENS:
            related = action.to_account.equals(props.activeAddress)
            break
          case ActionType.OTHER:
            related = false
            break
        }
        return !!related
      }) || []
    })

    // Handle edge case transaction types in wallet UI
    const customTxnDisplayType: ComputedRef<'UNKNOWN' | 'COMPLEX' | 'DEFAULT'> = computed(() => {
      if (props.transaction.actions.length <= 0) return 'UNKNOWN'
      else if (props.transaction.actions.length > 1) return 'COMPLEX'
      return 'DEFAULT'
    })

    return {
      customTxnDisplayType,
      explorerUrl,
      relatedActions
    }
  },

  computed: {
    sentAt (): string {
      return DateTime.fromJSDate(this.transaction.sentAt).toLocaleString(DateTime.DATETIME_SHORT)
    },

    showMessageLock (): boolean {
      return this.messageState === 'decrypted' || this.messageState === 'encrypted'
    },

    messageState (): string | null {
      if (!this.transaction.message) { return null }
      if (this.decryptedMessage) { return 'decrypted' }
      if (Message.isEncrypted(this.transaction.message)) { return 'encrypted' }
      return 'plaintext'
    }
  },

  methods: {
    decrypt () {
      this.$emit('decryptMessage', this.transaction)
    }
  },

  emits: ['decryptMessage']
})
</script>
