<template>
  <div>
    <div class="flex" :class="{'filter-blurSmall': !autofocus}">
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
      type="password"
      class="opacity-0 h-0 m-0 p-0"
      maxlength="4"
      ref="inputRef"
      v-model="value"
      :data-ci="dataCi"
      @blur="focusInput()"
      @input="handleChange($event.target.value)"
    />
    <span>{{ errorMessage }}</span>
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

    const { value, errorMessage } = useField<string>(props.name, 'required:length:4')

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
    }
  },

  mounted () {
    this.focusInput()
  },

  methods: {
    handleChange (value: string) {
      if (value.length === 4) this.$emit('finished', this.name)
    }
  },

  beforeUpdate () {
    if (this.autofocus) this.focusInput()
  },

  emits: ['finished']
})

export default PinInput
</script>
