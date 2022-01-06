<template>
  <div class="mt-1 relative w-56">
    <div
      class="bg-white relative flex items-center justify-between w-full border border-gray-300 rounded-sm shadow-sm px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-rBlue focus:border-rBlue sm:text-sm hover:bg-rGrayLight transition-colors"
      @click="toggleIsOpen"
    >
      <span class="block truncate flex-1">
        {{ selected.label }}
      </span>
      <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L7 7L13 1" class="stroke-current text-rBlack" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <ul
      v-if="isOpen"
      class="absolute z-10 top-0 w-full border-solid border border-rGray bg-white shadow-lg max-h-60 rounded-sm text-base overflow-auto focus:outline-none sm:text-sm"
    >
      <li
        v-for="(option, i) in options"
        :key="option.id"
        @click.prevent="() => handleSelect(option.id)"
        class="text-rBlue border-b border-solid border-rGray hover:bg-rGrayLight transition-colors cursor-pointer select-none relative py-2 px-3 flex items-center justify-between"
      >
        <span class="font-normal block truncate">
          {{ option.label }}
        </span>
        <svg v-if="i === 0" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" class="transform rotate-180">
          <path d="M1 1L7 7L13 1" class="stroke-current text-rBlue" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref } from 'vue'

export type AppSelectOptionT = {
  id: string | number;
  label: string;
}

export default defineComponent({
  props: {
    options: {
      type: Array as PropType<Array<AppSelectOptionT>>,
      required: true
    },
    selected: {
      type: Object as PropType<AppSelectOptionT>,
      required: false
    }
  },

  setup (props, { emit }) {
    const isOpen: Ref<boolean> = ref(false)
    const toggleIsOpen = () => { isOpen.value = !isOpen.value }
    const handleSelect = (id: string | number) => {
      isOpen.value = false
      emit('select', id)
    }

    return {
      isOpen,

      // methods
      handleSelect,
      toggleIsOpen
    }
  },

  emits: ['select']
})
</script>
