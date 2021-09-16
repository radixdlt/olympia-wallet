import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueRx from '@nopr3d/vue-next-rx'
import Toast, { PluginOptions, POSITION } from 'vue-toastification'
import './assets/tailwind.css'
import 'vue-toastification/dist/index.css'
import '@/validations'
import { i18n } from '@/text'

const options: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT,
  closeButton: false,
  icon: false,
  maxToasts: 3,
  timeout: 1500,
  hideProgressBar: true
}

createApp(App)
  .use(router)
  .use(VueRx)
  .use(i18n)
  .use(Toast, options)
  .mount('#app')
