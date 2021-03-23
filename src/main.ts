import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import '@/validations'

createApp(App).use(router)
  .use(router)
  .mount('#app')
