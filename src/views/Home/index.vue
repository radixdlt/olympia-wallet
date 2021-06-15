<template>
  <div data-ci="home-view" class="flex flex-row min-h-screen" :class="{'items-center': hasWallet.value}">
    <template v-if="!hasWallet.value">
      <div class="w-72 mx-5 py-8">
        <div class="flex">
          <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="w-30 mb-10">
          <svg width="54" height="17" viewBox="0 0 54 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="m-3">
            <rect width="48" height="17" rx="2" fill="#4F758B"/>
            <path d="M6.82 5.02H10.05C10.3367 5.02 10.5933 5.06333 10.82 5.15C11.0533 5.23667 11.25 5.35667 11.41 5.51C11.57 5.66333 11.69 5.85333 11.77 6.08C11.8567 6.3 11.9 6.54333 11.9 6.81C11.9 7.07667 11.8633 7.30333 11.79 7.49C11.7233 7.67 11.63 7.82 11.51 7.94C11.3967 8.06 11.2633 8.15 11.11 8.21C10.9633 8.27 10.81 8.30333 10.65 8.31V8.37C10.8033 8.37 10.9667 8.4 11.14 8.46C11.32 8.52 11.4833 8.61667 11.63 8.75C11.7833 8.87667 11.91 9.04333 12.01 9.25C12.11 9.45 12.16 9.7 12.16 10C12.16 10.28 12.1133 10.5433 12.02 10.79C11.9333 11.03 11.81 11.24 11.65 11.42C11.49 11.6 11.3 11.7433 11.08 11.85C10.86 11.95 10.62 12 10.36 12H6.82V5.02ZM8.14 10.88H9.98C10.2333 10.88 10.43 10.8167 10.57 10.69C10.71 10.5567 10.78 10.3667 10.78 10.12V9.78C10.78 9.53333 10.71 9.34333 10.57 9.21C10.43 9.07667 10.2333 9.01 9.98 9.01H8.14V10.88ZM8.14 7.93H9.77C10.01 7.93 10.1967 7.86667 10.33 7.74C10.4633 7.60667 10.53 7.42333 10.53 7.19V6.88C10.53 6.64667 10.4633 6.46667 10.33 6.34C10.1967 6.20667 10.01 6.14 9.77 6.14H8.14V7.93ZM15.4809 12.12C15.0942 12.12 14.7475 12.0567 14.4409 11.93C14.1409 11.7967 13.8842 11.6133 13.6709 11.38C13.4642 11.14 13.3042 10.8533 13.1909 10.52C13.0775 10.18 13.0209 9.8 13.0209 9.38C13.0209 8.96667 13.0742 8.59333 13.1809 8.26C13.2942 7.92667 13.4542 7.64333 13.6609 7.41C13.8675 7.17 14.1209 6.98667 14.4209 6.86C14.7209 6.72667 15.0609 6.66 15.4409 6.66C15.8475 6.66 16.2009 6.73 16.5009 6.87C16.8009 7.01 17.0475 7.2 17.2409 7.44C17.4342 7.68 17.5775 7.96 17.6709 8.28C17.7709 8.59333 17.8209 8.93 17.8209 9.29V9.71H14.3509V9.84C14.3509 10.22 14.4575 10.5267 14.6709 10.76C14.8842 10.9867 15.2009 11.1 15.6209 11.1C15.9409 11.1 16.2009 11.0333 16.4009 10.9C16.6075 10.7667 16.7909 10.5967 16.9509 10.39L17.6409 11.16C17.4275 11.46 17.1342 11.6967 16.7609 11.87C16.3942 12.0367 15.9675 12.12 15.4809 12.12ZM15.4609 7.62C15.1209 7.62 14.8509 7.73333 14.6509 7.96C14.4509 8.18667 14.3509 8.48 14.3509 8.84V8.92H16.4909V8.83C16.4909 8.47 16.4009 8.18 16.2209 7.96C16.0475 7.73333 15.7942 7.62 15.4609 7.62ZM20.577 12C20.137 12 19.8004 11.8867 19.567 11.66C19.3404 11.4267 19.227 11.0967 19.227 10.67V7.8H18.457V6.78H18.857C19.0504 6.78 19.1804 6.73667 19.247 6.65C19.3204 6.55667 19.357 6.42 19.357 6.24V5.35H20.507V6.78H21.577V7.8H20.507V10.98H21.497V12H20.577ZM26.5273 12C26.2473 12 26.0239 11.92 25.8573 11.76C25.6973 11.5933 25.5973 11.3733 25.5573 11.1H25.4973C25.4106 11.44 25.2339 11.6967 24.9673 11.87C24.7006 12.0367 24.3706 12.12 23.9773 12.12C23.4439 12.12 23.0339 11.98 22.7473 11.7C22.4606 11.42 22.3173 11.0467 22.3173 10.58C22.3173 10.04 22.5106 9.64 22.8973 9.38C23.2839 9.11333 23.8339 8.98 24.5473 8.98H25.4373V8.6C25.4373 8.30667 25.3606 8.08 25.2073 7.92C25.0539 7.76 24.8073 7.68 24.4673 7.68C24.1673 7.68 23.9239 7.74667 23.7373 7.88C23.5573 8.00667 23.4039 8.16 23.2773 8.34L22.5173 7.66C22.7106 7.36 22.9673 7.12 23.2873 6.94C23.6073 6.75333 24.0306 6.66 24.5573 6.66C25.2639 6.66 25.8006 6.82 26.1673 7.14C26.5339 7.46 26.7173 7.92 26.7173 8.52V10.98H27.2373V12H26.5273ZM24.4073 11.19C24.6939 11.19 24.9373 11.1267 25.1373 11C25.3373 10.8733 25.4373 10.6867 25.4373 10.44V9.75H24.6173C23.9506 9.75 23.6173 9.96333 23.6173 10.39V10.56C23.6173 10.7733 23.6839 10.9333 23.8173 11.04C23.9573 11.14 24.1539 11.19 24.4073 11.19ZM28.2732 12V6.78H29.5532V7.65H29.6032C29.7099 7.37 29.8765 7.13667 30.1032 6.95C30.3365 6.75667 30.6565 6.66 31.0632 6.66C31.6032 6.66 32.0165 6.83667 32.3032 7.19C32.5899 7.54333 32.7332 8.04667 32.7332 8.7V12H31.4532V8.83C31.4532 8.45667 31.3865 8.17667 31.2532 7.99C31.1199 7.80333 30.8999 7.71 30.5932 7.71C30.4599 7.71 30.3299 7.73 30.2032 7.77C30.0832 7.80333 29.9732 7.85667 29.8732 7.93C29.7799 7.99667 29.7032 8.08333 29.6432 8.19C29.5832 8.29 29.5532 8.41 29.5532 8.55V12H28.2732ZM36.2621 12.12C35.8754 12.12 35.5288 12.0567 35.2221 11.93C34.9221 11.7967 34.6654 11.6133 34.4521 11.38C34.2454 11.14 34.0854 10.8533 33.9721 10.52C33.8588 10.18 33.8021 9.8 33.8021 9.38C33.8021 8.96667 33.8554 8.59333 33.9621 8.26C34.0754 7.92667 34.2354 7.64333 34.4421 7.41C34.6488 7.17 34.9021 6.98667 35.2021 6.86C35.5021 6.72667 35.8421 6.66 36.2221 6.66C36.6288 6.66 36.9821 6.73 37.2821 6.87C37.5821 7.01 37.8288 7.2 38.0221 7.44C38.2154 7.68 38.3588 7.96 38.4521 8.28C38.5521 8.59333 38.6021 8.93 38.6021 9.29V9.71H35.1321V9.84C35.1321 10.22 35.2388 10.5267 35.4521 10.76C35.6654 10.9867 35.9821 11.1 36.4021 11.1C36.7221 11.1 36.9821 11.0333 37.1821 10.9C37.3888 10.7667 37.5721 10.5967 37.7321 10.39L38.4221 11.16C38.2088 11.46 37.9154 11.6967 37.5421 11.87C37.1754 12.0367 36.7488 12.12 36.2621 12.12ZM36.2421 7.62C35.9021 7.62 35.6321 7.73333 35.4321 7.96C35.2321 8.18667 35.1321 8.48 35.1321 8.84V8.92H37.2721V8.83C37.2721 8.47 37.1821 8.18 37.0021 7.96C36.8288 7.73333 36.5754 7.62 36.2421 7.62ZM41.3583 12C40.9183 12 40.5816 11.8867 40.3483 11.66C40.1216 11.4267 40.0083 11.0967 40.0083 10.67V7.8H39.2383V6.78H39.6383C39.8316 6.78 39.9616 6.73667 40.0283 6.65C40.1016 6.55667 40.1383 6.42 40.1383 6.24V5.35H41.2883V6.78H42.3583V7.8H41.2883V10.98H42.2783V12H41.3583Z" fill="#DDE5ED"/>
          </svg>
        </div>
        <p class="text-white font-normal text-normal leading-snug mr-12">
          <span class="text-lg"> {{ $t('home.welcomeOne') }} </span>
          <br/><br/>
          <span class="text-lg"> {{ $t('home.welcomeTwo') }} </span>
          <br/><br/>
          <span class="text-sm"> {{ $t('home.welcomeThree') }} </span>
          <br/><br/>
          <span class="text-sm"> {{ $t('home.welcomeFour') }} </span>
          <br/><br/>
          <span class="text-sm"> {{ $t('home.welcomeFive') }} </span>
        </p>
      </div>
      <div class="py-8 flex flex-row">
        <home-create-and-restore></home-create-and-restore>
      </div>
    </template>

    <template v-else>
      <img alt="Radix DLT Logo" src="../../assets/logo.svg" class="absolute inset-0 mt-6 mx-4">
      <div v-if="hasWallet.value == null" class="flex w-full justify-center items-center">
        <loading-icon></loading-icon>
      </div>

      <div
        v-if="hasWallet.value == true"
        class="bg-white py-8 px-11 max-w-lg rounded mx-auto"
      >
        <home-enter-passcode
          @submit="loginWithWallet"
          ref="enterPasscodeComponent"
        ></home-enter-passcode>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { Radix, ErrorNotification, WalletErrorCause, WalletT } from '@radixdlt/application'
import { hasKeystore, login, touchKeystore } from '@/actions/vue/create-wallet'
import { useStore } from '@/store'
import HomeCreateAndRestore from './HomeCreateAndRestore.vue'
import HomeEnterPasscode from './HomeEnterPasscode.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { Subscription } from 'rxjs'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from '@nopr3d/vue-next-rx'
import { filter } from 'rxjs/operators'

const CreateWallet = defineComponent({
  components: {
    HomeCreateAndRestore,
    HomeEnterPasscode,
    LoadingIcon
  },

  setup () {
    const hasWallet = reactive({ value: null as boolean | null })
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n({ useScope: 'global' })

    const enterPasscodeComponent = ref(null)

    const radix = Radix
      .create()
      .connect('https://betanet.radixdlt.com/rpc')
    const subs = new Subscription()

    radix.errors
      .pipe(filter((errorNotification: ErrorNotification) => errorNotification.cause === WalletErrorCause.LOAD_KEYSTORE_FAILED))
      .subscribe(
        () => {
          enterPasscodeComponent.value.setErrors({
            password: t('validations.incorrectPassword')
          })
        }
      )

    // Move user to wallet when a wallet is successfully retrieved
    subs.add(radix.__wallet.subscribe((wallet: WalletT) => {
      store.commit('setWallet', wallet)
      router.push('/wallet')
    }))

    // Login with password and path to keystore
    const loginWithWallet = (password: string) => {
      radix.login(password, touchKeystore)
      login(password, touchKeystore)
    }

    // Check if keystore exists
    hasKeystore().then((res: boolean) => { hasWallet.value = res })

    return {
      // state
      hasWallet,
      // methods
      loginWithWallet,
      // component refs
      enterPasscodeComponent
    }
  }
})

export default CreateWallet
</script>
