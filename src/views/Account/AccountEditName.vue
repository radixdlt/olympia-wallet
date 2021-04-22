<template>
  <div class="relative bg-white w-full flex-1">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col pt-20 pb-6 pl-16 pr-8 relative z-10 max-w-lg"
    >
      <h2 class="text-5xl text-rBlack font-thin leading-tight mb-9">{{ $t('account.editNameHeading') }}</h2>
      <input
        v-model="name"
        class="w-full border-t-0 border-r-0 border-l-0 py-5 border-b border-rBlack leading-8 focus:ring-0 focus:outline-none focus:border-rGreen mb-40 max-w-sm"
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
import { defineComponent, PropType, watch } from 'vue'
import { getAccountName, saveAccountName } from '@/actions/vue/data-store'
import { AddressT } from '@radixdlt/account'
import { ref } from '@nopr3d/vue-next-rx'
import ButtonSubmit from '@/components/ButtonSubmit.vue'

const AccountEditName = defineComponent({
  components: {
    ButtonSubmit
  },

  props: {
    activeAddress: {
      type: Object as PropType<AddressT>,
      required: true
    }
  },

  setup (props) {
    const name = ref('')

    // Set initial value for input field
    getAccountName(props.activeAddress.toString())
      .then((storedName: string) => { name.value = storedName })

    // Update input value if active address changes
    watch(() => props.activeAddress, (activeAddress) => {
      getAccountName(activeAddress.toString())
        .then((storedName: string) => { name.value = storedName })
    })

    return { name }
  },

  methods: {
    handleSubmit () {
      saveAccountName(this.activeAddress.toString(), this.name)
        .then(() => this.$emit('save'))
    }
  }
})

export default AccountEditName
</script>
