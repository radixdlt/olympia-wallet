import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory, RouterScrollBehavior } from 'vue-router'
import Home from '../views/Home/index.vue'
import CreateWallet from '../views/CreateWallet/index.vue'
import RestoreWallet from '../views/RestoreWallet/index.vue'
import Wallet from '../views/Wallet/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    props: route => ({
      initialView: route.query.initialView,
      initialSidebar: route.query.initialSidebar
    })
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

const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) { return savedPosition }
  return { top: 0, left: 0 }
}

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior
})

export default router
