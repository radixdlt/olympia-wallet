<template>
  <div class="relative">
    <div class="flex -mr-11" :class="{'filter-blurSmall': !autofocus}">
      <div
        v-for="(digit, i) in [1, 2, 3, 4]"
        :key="i"
        class="rounded-full w-16 h-16 mr-11 border transition-colors"
        :class="{
          'bg-rGreen border-rGreen': value && value.length > i,
          'border-rGrayDark': !(value && value.length > i),
        }"
      />
    </div>
    <input
      :name="name"
      type="number"
      class="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
      ref="inputRef"
      v-model="value"
      :data-ci="dataCi"
      @blur="focusInput()"
      @input="handleChange"
    />

    <div v-if="errorMessage" class="flex flex-row items-center justify-center text-rRed mt-4">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
      <circle cx="7" cy="7" r="6.5" transform="rotate(90 7 7)" fill="#EF4136" stroke="#EF4136"/>
      <rect x="4" y="5" width="1" height="7" transform="rotate(-45 4 5)" fill="white"/>
      <rect x="8.94971" y="4.29297" width="1" height="7" transform="rotate(45 8.94971 4.29297)" fill="white"/>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useField } from 'vee-validate'

const PinInput = defineComponent({
  setup (props) {
    // eslint-disable-next-line func-call-spacing
    const inputRef = ref<null | { focus: () => null }> (null)
    const focusInput = () => {
      if (props.autofocus && inputRef.value) {
        return inputRef.value.focus()
      }
    }

    const { value, errorMessage } = props.required ? useField<string>(props.name, 'required') : useField<string>(props.name)

    return {
      inputRef,
      focusInput,
      value,
      errorMessage
    }
  },

  props: {
    name: {
      type: String,
      required: true
    },
    values: String,
    autofocus: Boolean,
    dataCi: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  mounted () {
    this.focusInput()
  },

  methods: {
    handleChange (event: any) {
      if (this.value.length > 4) this.value = this.value.slice(0, 4)
      if (event.target.value.length >= 4) {
        this.$emit('finished', this.name)
      } else {
        this.$emit('unfinished', this.name)
      }
    }
  },

  updated () {
    if (this.autofocus) this.focusInput()
  },

  emits: ['finished', 'unfinished']
})

export default PinInput
</script>
