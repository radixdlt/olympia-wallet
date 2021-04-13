<template>
  <div class="border border-rGray rounded-md py-2 px-4 flex flex-row mb-1">
    <div class="flex flex-col flex-1">
      <div class="truncate w-48">{{ stake.validator.toString() }}</div>
      <div class="text-sm text-rBlack flex flex-row items-center">
        <big-amount :amount="stake.amount" /> <span class="text-rGrayDark ml-1">XRD</span>
        <template v-if="unstaking">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin ml-3 mr-1">
            <g clip-path="url(#clip0)">
            <path d="M6.81934 0V4" stroke="#003057" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M6.81934 10V14" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M2.70508 1.33594L5.05618 4.57194" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M8.58301 9.42773L10.9341 12.6637" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M0.162109 4.83594L3.96631 6.07194" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M9.67236 7.92773L13.4766 9.16373" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M0.162109 9.16373L3.96631 7.92773" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M9.67236 6.07194L13.4766 4.83594" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M2.70508 12.6637L5.05618 9.42773" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            <path d="M8.58301 4.57194L10.9341 1.33594" stroke="#7A99AC" stroke-width="1.0485" stroke-miterlimit="10"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="13.6388" height="14" fill="white"/>
            </clipPath>
            </defs>
          </svg>
          <span class="text-rGrayDark">{{ $t('staking.unstakingLabel') }}</span>
        </template>
      </div>
    </div>
    <div class="flex flex-row items-start mt-1">
      <button
        class="text-sm text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto mr-3"
        @click="$emit('addToValidator', stake.validator)"
      >
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rBlue">
          <circle cx="12" cy="12.9961" r="11.5" transform="rotate(-180 12 12.9961)" class="stroke-current"/>
          <line x1="12" y1="18.9961" x2="12" y2="6.99609" class="stroke-current"/>
          <line x1="18" y1="12.9961" x2="6" y2="12.9961" class="stroke-current"/>
        </svg>
      </button>

      <button
        class="text-sm text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto"
        @click="$emit('reduceFromValidator', stake.validator)"
      >
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-rBlue">
          <circle cx="12" cy="12.9961" r="11.5" transform="rotate(-180 12 12.9961)" class="stroke-current"/>
          <line x1="18" y1="12.9961" x2="6" y2="12.9961" class="stroke-current"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { StakePosition, UnstakePosition } from '@radixdlt/application'
import { defineComponent, PropType } from 'vue'
import BigAmount from '@/components/BigAmount.vue'

const StakeListItem = defineComponent({
  components: {
    BigAmount
  },

  props: {
    stake: {
      type: Object as PropType<StakePosition | UnstakePosition>,
      required: true
    },
    unstaking: {
      type: Boolean,
      required: true
    }
  },

  emits: ['addToValidator', 'reduceFromValidator']
})

export default StakeListItem
</script>
