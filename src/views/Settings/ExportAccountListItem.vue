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
      <span v-if="name" class="text-sm">{{ name }}</span>
      <span class="flex items-center gap-1 text-xs text-rBlue">
        {{ address.toString() }}
      </span>
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
    }
  }
})
</script>
