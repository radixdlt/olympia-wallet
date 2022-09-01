<template>
  <div>
    <input
      :id="name"
      :name="name"
      v-model="inputValue"
      :placeholder="placeholder"
      type="text"
      class="focus:outline-none focus:ring-transparent focus:shadow-none focus:border-rGreen px-0 border-t-0 border-l-0 border-r-0 border-b border-rBlack w-full font-mono placeholder-sans border-t-0 border-l-0 border-r-0 border-b border-rBlack"
      @input="onInput"
      @change="onInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef } from 'vue'
import { useField } from 'vee-validate'

const AmountField = defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    rules: {
      type: [String, Object],
      required: true
    }
  },

  setup (props, { emit }) {
    const rules = toRef(props, 'rules')
    const name = toRef(props, 'name')
    const { value: inputValue, handleChange, handleBlur } = useField<string>(name, rules)

    const onInput = (event: Event) => {
      const result = (event.target as HTMLInputElement).value || ''
      const sanitized = result.replace(/[^\d,.]/g, '')
      const sanitizedOrUndefined = sanitized === '' ? undefined : sanitized
      handleChange(sanitizedOrUndefined)
    }

    return {
      inputValue, onInput, handleBlur
    }
  }
})

export default AmountField
</script>
