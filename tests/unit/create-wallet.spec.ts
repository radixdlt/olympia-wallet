import { expect } from 'chai'
import { mount, flushPromises } from '@vue/test-utils'
import App from '@/App.vue'
import router from '@/router'

describe('create wallet', () => {
  it('a user on the homescreen can click to begin creating a wallet', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.html()).to.include('data-ci="home-view"')

    await wrapper.find('a[data-ci="create-wallet-button"]').trigger('click')
    await flushPromises()
    expect(wrapper.html()).to.include('data-ci="create-wallet-view"')
  })
})
