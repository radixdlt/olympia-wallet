<template>
  <div class="relative w-full">
    <FormField
      type="password"
      :name="name"
      :rules="rules"
      :data-ci="dataCi"
      class="w-full"
      :placeholder="placeholder"
      :label="label"
      :validateOnInput="validateOnInput"
      :validateOnBlur="validateOnBlur"
      @blur="clearCapsLockStatus"
      @keyup="checkCapsLock"
      @keydown.caps-lock="checkCapsLock"
    >
    </FormField>
    <div v-if="isCapsEnabled" class="absolute top-2 right-0 flex flex-row
    items-center">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.19995" y="9.6001" width="5.6" height="2.4" fill="#EF4136"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.4L6 0L0 6.4H3.2V8H8.8V6.4H12Z" fill="#EF4136"/>
      </svg>
      <span class="ml-2 text-red-400">caps lock on</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FormField from '@/components/FormField.vue'

const PasswordField = defineComponent({
  components: {
    FormField
  },

  data () {
    return {
      isCapsEnabled: false
    }
  },

  methods: {
    checkCapsLock (event: KeyboardEvent) {
      this.isCapsEnabled = event.getModifierState('CapsLock')
    },
    clearCapsLockStatus () {
      this.isCapsEnabled = false
    }
  },

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
    validateOnBlur: {
      type: Boolean,
      required: false,
      default: true
    },
    underlineStyle: {
      type: Boolean,
      required: false,
      default: true
    }
  }
})

export default PasswordField
</script>
