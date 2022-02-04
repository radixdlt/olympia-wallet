<template>
  <div>
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
    <path d="M25 14V36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 25H36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  <div>
    <p class="text-justify p-6">If you previously used multiple accounts in the wallet, all of these accounts are associated to your seed phrase and will be recovered in the order you added them. However, the Desktop Wallet app cannot tell from the seed phrase how many accounts you had before or what you named them.<br><br>
      On the next screen you will be asked to provide a new name for the first account you used previously. After this, please use the "Add Account" feature to re-add, name, and access your other previous accounts. They will be re-added in exactly the same order as before, and will hold any tokens you held there previously.</p>
    <ButtonSubmit class="w-50 my-5" :disabled="false" @click="$emit('understood', true) ">
      I understand
    </ButtonSubmit>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
export default defineComponent({
  components: {
    ButtonSubmit
  },
  setup () {
    const isVisible: Ref<boolean> = ref(true)
    const handleClose = () => {
      isVisible.value = false
    }
    return {
      handleClose,
      isVisible
    }
  },
  emits: ['understood']
})

</script>
