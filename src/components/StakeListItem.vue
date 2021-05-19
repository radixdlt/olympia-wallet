<template>
  <div class="border border-rGray rounded-md py-2 px-4 flex flex-row mb-1 text-rBlack flex-wrap">
    <div class="flex flex-col flex-1">
      <div
        v-if="validator"
        class="text-sm"
      >
        {{ validator.name }}
      </div>
      <div class="text-sm flex items-center text-rGrayMed">
        {{ validatorAddress }}
        <click-to-copy :text="stake.validator.toString()" class="hover:text-rGreen active:text-rGreenDark" />
      </div>
      <div class="text-sm text-rBlack flex flex-row items-center">
        <big-amount :amount="stake.amount" /> <span class="text-rGrayDark ml-1">XRD</span>
      </div>
      <div
        v-for="(unstake, i) in unstakesForValidator"
        :key="i"
        class="text-sm text-rBlack flex flex-row items-center"
      >
        <big-amount :amount="unstake.amount" /> <span class="text-rGrayDark ml-1">XRD</span>
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
      </div>
    </div>
    <div class="flex flex-row items-end mb-px text-rGrayDark text-sm">
      <button
        class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto mr-px outline-none focus:outline-none"
        @click="$emit('addToValidator', stake.validator)"
      >
        {{ $t('staking.addButton') }}
      </button>
      /
      <button
        class="text-rBlue hover:text-rGreen transition-colors cursor-pointer pointer-events-auto ml-px outline-none focus:outline-none"
        @click="$emit('reduceFromValidator', stake.validator)"
      >
        {{ $t('staking.reduceButton') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Radix, StakePosition, UnstakePosition, Validator } from '@radixdlt/application'
import { defineComponent, PropType, Ref, ref } from 'vue'
import BigAmount from '@/components/BigAmount.vue'
import ClickToCopy from '@/components/ClickToCopy.vue'
import { Subscription } from 'rxjs'

const StakeListItem = defineComponent({
  components: {
    BigAmount,
    ClickToCopy
  },

  props: {
    stake: {
      type: Object as PropType<StakePosition>,
      required: true
    },
    activeUnstakes: {
      type: Object as PropType<Array<UnstakePosition>>,
      required: true
    }
  },

  setup (props) {
    const validator: Ref<Validator | null> = ref(null)

    const radix = Radix
      .create()
      .connect('https://betanet.radixdlt.com/rpc')

    const subs = new Subscription()

    subs
      .add(radix.ledger.lookupValidator(props.stake.validator)
        .subscribe((validatorRes: Validator) => { validator.value = validatorRes }))

    return {
      validator
    }
  },

  computed: {
    validatorAddress (): string {
      const address = this.stake.validator.toString()
      return `${address.slice(0, 14)}...${address.slice(-13)}`
    },
    unstakesForValidator (): UnstakePosition[] {
      return this.activeUnstakes.filter((unstake: UnstakePosition) => unstake.validator.equals(this.stake.validator))
    }
  },

  emits: ['addToValidator', 'reduceFromValidator']
})

export default StakeListItem
</script>
