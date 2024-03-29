<template>
  <div class="flex flex-col overflow-y-auto relative bg-white w-full flex-1">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col pt-20 pb-6 pl-16 pr-8 relative z-10 max-w-lg"
    >
      <h2 class="text-5xl text-rBlack font-thin leading-tight mb-9">{{ $t('account.editNameHeading') }}</h2>
      <input
        v-model="name"
        class="w-full border-t-0 border-r-0 border-l-0 py-5 border-b border-rBlack leading-8 focus:ring-0 focus:outline-none focus:border-rGreen mb-36 max-w-sm"
        :placeholder="$t('account.nameInputPlaceholder')"
      />

      <ButtonSubmit :disabled="!name">
        {{ $t('account.updateNameButton') }}
      </ButtonSubmit>
    </form>

    <img src="@/assets/account.svg" class="absolute right-0 top-0 h-full" />
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { saveAccountName } from '@/actions/vue/data-store'
import { ref } from '@nopr3d/vue-next-rx'
import ButtonSubmit from '@/components/ButtonSubmit.vue'
import { useOfflineWallet, useWallet } from '@/composables'
import { useRouter } from 'vue-router'

const AccountEditName = defineComponent({
  components: {
    ButtonSubmit
  },

  setup () {
    const name = ref('')
    const router = useRouter()
    const { fetch } = useOfflineWallet()
    const { accountNameFor, activeAddress, accountRenamed } = useWallet(router)
    if (!activeAddress.value) {
      router.push('/')
      return
    }

    watch((activeAddress), (newActiveAddress, oldActiveAddress) => {
      if (!newActiveAddress) return
      if (oldActiveAddress && newActiveAddress.equals(oldActiveAddress)) return
      name.value = accountNameFor(newActiveAddress)
    }, { immediate: true })

    const handleSubmit = () => {
      if (!activeAddress.value) return
      saveAccountName(activeAddress.value.toString(), name.value)
        .then(() => {
          accountRenamed(name.value)
          fetch()
        })
    }
    return { name, handleSubmit }
  }
})

export default AccountEditName
</script>
