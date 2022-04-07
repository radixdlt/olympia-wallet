import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from '../views/Home/index.vue'
import CreateWallet from '../views/CreateWallet/index.vue'
import RestoreWallet from '../views/RestoreWallet/index.vue'
import Wallet from '../views/Wallet/index.vue'
import WalletOverview from '../views/Wallet/WalletOverview.vue'
import WalletTransaction from '../views/Wallet/WalletTransaction.vue'
import WalletStaking from '../views/Wallet/WalletStaking.vue'
import WalletHistory from '../views/Wallet/WalletHistory.vue'
import AccountEditName from '@/views/Account/AccountEditName.vue'
import SettingsIndex from '@/views/Settings/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    props: route => ({
      modal: route.query.modal
    })
  },
  {
    path: '/wallet/:activeAccountId',
    name: 'Wallet',
    component: Wallet,
    children: [
      {
        path: '',
        component: WalletOverview
      },
      {
        path: 'transaction',
        component: WalletTransaction
      },
      {
        path: 'staking',
        component: WalletStaking
      },
      {
        path: 'history',
        component: WalletHistory
      },
      {
        path: 'account-edit-name',
        component: AccountEditName
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsIndex
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
