import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CreateWallet from '../views/CreateWallet/index.vue'
import RestoreWallet from '../views/RestoreWallet/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/create-wallet',
    name: 'Create Wallet',
    component: CreateWallet
  },
  {
    path: '/restore-wallet',
    name: 'Restore Wallet',
    component: RestoreWallet
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(process.env.BASE_URL),
  routes
})

export default router
