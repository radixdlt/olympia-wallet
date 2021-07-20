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
          <div class="inline-block align-bottom bg-white rounded px-6 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-8">
            <div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="font-bold text-rRed">
                  Incorrect PIN
                </DialogTitle>
                <div class="my-4 px-8">
                  <p class="text-rBlack leading-5">
                    Sorry, you’ve made too many incorrect PIN entry attempts. You’ll need to enter your password to access your account.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-8">
              <button type="button" class="inline-flex justify-center w-full rounded border-transparent border-4 shadow-sm px-4 py-4 bg-rGreen text-base text-white focus:outline-none hover:bg-rGreenDark active:bg-rGray sm:text-sm" @click="close">
                Okay
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
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

  methods: {
    close () {
      this.$emit('close')
    }
  },

  emits: ['close']
})
</script>
