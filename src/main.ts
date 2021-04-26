import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueRx from '@nopr3d/vue-next-rx'
import './assets/tailwind.css'
import '@/validations'
import { store, key } from '@/store'
import { i18n } from '@/text'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

createApp(App)
  .use(router)
  .use(VueRx)
  .use(store, key)
  .use(i18n)
  .mount('#app')
