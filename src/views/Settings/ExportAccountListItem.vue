<template>
  <div class="p-3 items-center justify-between flex border rounded-md gap-x-4">
    <div class="flex-grow-0">
      <input
        type="checkbox"
        :checked="selected.includes(address.toString())"
        :value="address.toString()"
        :id="name"
        @input="$emit('toggle', address.toString())"
      />
    </div>
    <div class="flex flex-col gap-2 flex-1">
      <div>
        <span v-if="name" class="text-sm mr-2">{{ name }}</span>
        <span v-if="isHidden" class="text-sm text-rGrayMed">(Hidden)</span>
      </div>
      <div class="flex items-center gap-1 text-xs text-rBlue">
        {{ address.toString() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AccountAddressT } from '@radixdlt/application'

export default defineComponent({
  props: {
    address: {
      type: Object as PropType<AccountAddressT>,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    selected: {
      type: Array as PropType<string[]>,
      required: true
    },
    isHidden: {
      type: Boolean,
      required: true
    }
  }
})
</script>
