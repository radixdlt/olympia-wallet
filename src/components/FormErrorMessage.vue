<template>
  <div class="relative my-2 w-full">
    <ErrorMessage :name="name" v-slot="{ message }">
      <div class="flex flex-row items-center text-rRed absolute" :class="errorClass">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-3">
          <circle cx="7" cy="7" r="6.5" transform="rotate(90 7 7)" fill="#EF4136" stroke="#EF4136"/>
          <rect x="4" y="5" width="1" height="7" transform="rotate(-45 4 5)" fill="white"/>
          <rect x="8.94971" y="4.29297" width="1" height="7" transform="rotate(45 8.94971 4.29297)" fill="white"/>
        </svg>
        <span>{{ message }}</span>
      </div>
    </ErrorMessage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ErrorMessage } from 'vee-validate'

const FormErrorMessage = defineComponent({
  components: {
    ErrorMessage
  },

  props: {
    name: {
      type: String,
      required: true
    },
    errorClass: {
      type: String,
      required: false
    }
  }
})

export default FormErrorMessage
</script>
