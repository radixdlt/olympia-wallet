<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="close" :open="open">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-rBlack bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="inline-block align-bottom bg-white rounded px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:px-4">
            <div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="text-rRed">
                  {{ $t('home.deleteWalletTitle') }}
                </DialogTitle>
                <div class="mt-4 px-8">
                  <p class="text-rBlack leading-5 text-center">{{ $t('home.deleteWalletContent') }}</p>
                </div>
              </div>
            </div>
            <div class="mt-5 mx-16" v-if="mode == 'choice'">
              <p class="text-rBlack leading-5 text-center mb-4">
                {{ $t('home.deleteChoiceContent') }}
              </p>
              <button type="button" class="inline-flex justify-center w-full rounded border-transparent border shadow-sm px-4 py-3 bg-rRed text-base text-white focus:outline-none" @click="mode = 'restore'">
                {{ $t('home.deleteRestoreButton') }}
              </button>
              <button type="button" class="inline-flex justify-center w-full rounded border-rRed border shadow-sm px-4 py-3 bg-white text-base text-rRed focus:outline-none mt-4" @click="mode = 'create'">
                {{ $t('home.deleteCreateButton') }}
              </button>
            </div>
            <div class="mt-5 mx-16" v-if="mode == 'restore'">
              <h2 class="font-bold mb-4 text-center">{{ $t('home.deleteRestoreConfirm') }}</h2>
              <form @submit.prevent="submitRestore">
                <div class="flex flex-col">
                  <input
                    type="text"
                    v-model="confirmRestore"
                    class="focus:outline-none focus:ring-transparent focus:shadow-none focus:border-rGreen border-t-0 border-l-0 border-r-0 border-b border-rBlack px-0 placeholder-rGrayMed text-center py-3 mb-4"
                    placeholder="Are you sure?"
                  >

                  <button
                    type="submit"
                    :class="{
                      'inline-flex justify-center w-full rounded border-transparent border shadow-sm px-4 py-3 text-base focus:outline-none': true,
                      'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': restoreDisabled,
                      'bg-rRed border-4 border-rRed text-white active:bg-rGray': !restoreDisabled
                    }"
                    :disabled="restoreDisabled"
                  >
                    {{ $t('home.restoreConfirmButton') }}
                  </button>
                </div>
              </form>
            </div>
            <div class="mt-5 mx-16" v-if="mode == 'create'">
              <h2 class="font-bold mb-4 text-center">Type DELETE WALLET below to confirm</h2>
              <form @submit.prevent="submitCreate">
                <div class="flex flex-col">
                  <input
                    type="text"
                    v-model="confirmCreate"
                    class="focus:outline-none focus:ring-transparent focus:shadow-none focus:border-rGreen border-t-0 border-l-0 border-r-0 border-b border-rBlack px-0 placeholder-rGrayMed text-center py-3 mb-4"
                    placeholder="Are you sure?"
                  >

                  <button
                    type="submit"
                    :class="{
                      'inline-flex justify-center w-full rounded border-transparent border shadow-sm px-4 py-3 text-base focus:outline-none': true,
                      'bg-rGray border-rGray text-rGrayDark cursor-not-allowed': createDisabled,
                      'bg-rRed border-4 border-rRed text-white active:bg-rGray': !createDisabled
                    }"
                    :disabled="createDisabled"
                  >
                    {{ $t('home.restoreConfirmButton') }}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <button type="button" class="inline-flex justify-center w-full rounded shadow-sm mb-3 text-xs text-rGrayMed focus:outline-none mt-4" @click="close">
                {{ $t('home.forgotPasswordExit') }}
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, Ref } from 'vue'
import { ref } from '@nopr3d/vue-next-rx'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

export default defineComponent({
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot
  },

  props: {
    open: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      confirmRestore: '',
      confirmCreate: ''
    }
  },

  setup () {
    const mode: Ref<string> = ref('choice')
    return { mode }
  },

  computed: {
    restoreDisabled (): boolean {
      return this.confirmRestore !== 'DELETE AND RESTORE'
    },

    createDisabled (): boolean {
      return this.confirmCreate !== 'DELETE WALLET'
    }
  },

  methods: {
    close () {
      this.mode = 'choice'
      this.confirmRestore = ''
      this.confirmCreate = ''
      this.$emit('close')
    },

    submitCreate () {
      this.mode = 'choice'
      this.confirmRestore = ''
      this.confirmCreate = ''
      this.$emit('resetAndCreate')
    },

    submitRestore () {
      this.mode = 'choice'
      this.confirmRestore = ''
      this.confirmCreate = ''
      this.$emit('resetAndRestore')
    }
  },

  emits: ['close', 'resetAndCreate', 'resetAndRestore']
})
</script>
