import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueRx from '@nopr3d/vue-next-rx'
import './assets/tailwind.css'
import '@/validations'
import { store, key } from '@/store'

createApp(App)
  .use(router)
  .use(VueRx)
  .use(store, key)
  .mount('#app')
