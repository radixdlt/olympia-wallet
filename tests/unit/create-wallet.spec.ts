import { expect } from 'chai'
import { mount, flushPromises } from '@vue/test-utils'
import App from '@/App.vue'
import CreateWalletViewMnemonic from '@/views/CreateWallet/CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from '@/views/CreateWallet/CreateWalletEnterMnemonic.vue'
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

  it('a user can see a 12 word mnemonic', async () => {
    await router.isReady()
    const testMnemonic: string[] = ['special', 'cheap', 'poverty', 'alert', 'minute', 'behave', 'pride', 'step', 'radio', 'sugar', 'kidney', 'smoke']
    const wrapper = mount(CreateWalletViewMnemonic, {
      props: {
        mnemonic: testMnemonic
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.html()).to.include('data-ci="create-wallet-view-mnemonic-component"')
    expect(wrapper.vm.mnemonic.toString()).to.equal(testMnemonic.toString())
    testMnemonic.map(word => {
      expect(wrapper.html()).to.include(word)
    })
    await flushPromises()
  })

  it('a user can input a 4 randoms words to confirm their mnemonic', async () => {
    await router.isReady()
    const testMnemonic: string[] = ['special', 'cheap', 'poverty', 'alert', 'minute', 'behave', 'pride', 'step', 'radio', 'sugar', 'kidney', 'smoke']
    const wrapper = mount(CreateWalletEnterMnemonic, {
      props: {
        mnemonic: testMnemonic
      },
      global: {
        plugins: [router]
      }
    })

    const allInputs = wrapper.findAll('input')
    const disabledInputs = allInputs.filter(el => el.attributes('disabled') === '')
    const enabledInputs = allInputs.filter(el => el.attributes('disabled') !== '')

    expect(wrapper.html()).to.include('data-ci="create-wallet-enter-mnemonic-component"')
    expect(wrapper.vm.mnemonic.toString()).to.equal(testMnemonic.toString())
    expect(allInputs).lengthOf(12)
    expect(disabledInputs).lengthOf(8)
    expect(enabledInputs).lengthOf(4)
    await flushPromises()
  })

  it('when a user correctly inputs 4 randoms words to confirm their mnemonic, then they can proceed', async () => {
    await router.isReady()
    const testMnemonic: string[] = ['special', 'cheap', 'poverty', 'alert', 'minute', 'behave', 'pride', 'step', 'radio', 'sugar', 'kidney', 'smoke']
    const wrapper = mount(CreateWalletEnterMnemonic, {
      props: {
        mnemonic: testMnemonic
      },
      global: {
        plugins: [router]
      }
    })
    const allInputs = wrapper.findAll('input')

    expect(wrapper.find('button[data-ci="create-wallet-enter-mnemonic-component--confirm-button"]').attributes('disabled')).to.equal('')

    const updateInputs = async () => {
      return Promise.all(allInputs.map(async (input, i: number) => {
        if (input.attributes('disabled') !== '') {
          return await input.setValue(testMnemonic[i])
        }
        return Promise.resolve()
      }))
    }
    await updateInputs()

    expect(wrapper.vm.inputWords.toString()).to.equal(testMnemonic.toString())
    expect(wrapper.find('button[data-ci="create-wallet-enter-mnemonic-component--confirm-button"]').attributes('disabled')).to.equal(undefined)

    await flushPromises()
  })
})
