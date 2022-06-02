<template>
  <div>
    <label :for="name" class="flex items-center space-x-2">
      <input
        type="checkbox"
        :value="value"
        :name="name"
        :id="name"
        @input="handleChange"
      />
      <span>{{label}}</span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import { useField } from 'vee-validate'

const FormField = defineComponent({
  setup (props) {
    const { name, value } = toRefs(props)
    const { checked, handleChange } = useField(name, props.rules, {
      // Will make the checkbox set its value to true/false if it was checked or not
      type: 'checkbox',
      valueProp: value,
      initialValue: false,
      uncheckedValue: false
    })

    return {
      checked,
      handleChange
    }
  },

  props: {
    name: {
      type: String,
      required: true
    },
    rules: {
      type: [String, Object],
      required: false
    },
    dataCi: {
      type: String,
      required: false
    },
    value: {
      type: null,
      default: false
    },
    label: {
      type: String,
      required: true
    }
  }
})

export default FormField
</script>
