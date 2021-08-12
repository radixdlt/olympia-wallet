<template>
  <Field
    :type="type"
    :name="name"
    :label="label"
    class="focus:outline-none focus:ring-transparent focus:shadow-none focus:border-rGreen px-0"
    :class="{
      'border-t-0 border-l-0 border-r-0 border-b border-rBlack': underlineStyle
    }"
    :placeholder="placeholder"
    :rules="rules"
    :data-ci="dataCi"
    :validateOnInput="validateOnInput"
  ></Field>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Field } from 'vee-validate'

const FormField = defineComponent({
  components: {
    Field
  },

  props: {
    type: {
      type: String,
      required: true
    },
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
    },
    dataCi: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: false
    },
    validateOnInput: {
      type: Boolean,
      required: false,
      default: false
    },
    underlineStyle: {
      type: Boolean,
      required: false,
      default: true
    }
  }
})

export default FormField
</script>
