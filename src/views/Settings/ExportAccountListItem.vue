<template>
  <label class="p-3 items-center justify-between flex border rounded-md gap-x-4 transition-colors ease-in-out" :class="{'border-rBlue': addressSelected}" :for="address.toString()">
    <div class="flex-grow-0">
      <input
        type="checkbox"
        :checked="addressSelected"
        :value="address.toString()"
        :id="address.toString()"
        @input="$emit('toggle', address.toString())"
      />
    </div>
    <div class="flex flex-col gap-2 flex-1">
      <div>
        <span v-if="name" class="text-sm mr-2">{{ cleanedUpName }}</span>
        <span v-if="isHidden" class="text-sm text-rGrayMed">(Hidden)</span>
      </div>
      <div class="flex items-center gap-1 text-xs text-rBlue">
        {{ address.toString() }}
      </div>
    </div>
  </label>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, computed } from 'vue'
import { AccountAddressT } from '@radixdlt/application'
import { sanitizeName } from '@/helpers/exportAsCode'

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
  },

  setup (props) {
    const address = toRef(props, 'address')
    const selected = toRef(props, 'selected')
    const name = toRef(props, 'name')
    const cleanedUpName = computed(() => {
      if (!name.value) return null
      const sanitized = sanitizeName(name.value)
      return sanitized.substring(0, sanitized.length - 1)
    })
    const addressSelected = computed(() => selected.value.includes(address.value.toString()))
    return {
      addressSelected,
      cleanedUpName
    }
  }
})
</script>
