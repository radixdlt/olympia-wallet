<template>
  <AppModal
    :visible="isVisible"
    :title="'Re-adding Accounts'"
  >
    <template v-slot:icon>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="24" stroke="#052CC0" stroke-width="1.5"/>
      <path d="M25 14V36" stroke="#052CC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

    </template>
    <template v-slot:content>
      <p>If you previously used multiple accounts in the wallet, all of these accounts are associated to your seed phrase and will be recovered in the order you added them. However, the Desktop Wallet app cannot tell from the seed phrase how many accounts you had before or what you named them.</p>

      <p>On the next screen you will be asked to provide a new name for the first account you used previously. After this, please use the "Add Account" feature to re-add, name, and access your other previous accounts. They will be re-added in exactly the same order as before, and will hold any tokens you held there previously.</p>
      <div>
        <ButtonSubmit class="w-96" :disabled="disableSubmit">
          I Understand
        </ButtonSubmit>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

export default defineComponent({
  components: {
    ButtonSubmit,
    AppModal
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
  }
})
</script>
