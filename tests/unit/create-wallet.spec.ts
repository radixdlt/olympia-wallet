import { expect } from 'chai'
import { mount, flushPromises } from '@vue/test-utils'
import CreateWalletViewMnemonic from '@/views/CreateWallet/CreateWalletViewMnemonic.vue'
import CreateWalletEnterMnemonic from '@/views/CreateWallet/CreateWalletEnterMnemonic.vue'
import CreateWalletCreatePasscode from '@/views/CreateWallet/CreateWalletCreatePasscode.vue'
import CreateWalletCreatePin from '@/views/CreateWallet/CreateWalletCreatePin.vue'
import router from '@/router'
import '@/validations'

describe('create wallet', () => {
  it('a user can see a 12 word mnemonic', async () => {
    router.push('/create-wallet')
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
    router.push('/create-wallet')
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
    router.push('/create-wallet')
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

  it('a user will see validation errors for a mismatched passcode', async () => {
    router.push('/create-wallet')
    await router.isReady()
    const wrapper = mount(CreateWalletCreatePasscode, {
      global: {
        plugins: [router]
      }
    })

    const passcodeInput = wrapper.find('input[data-ci="create-wallet-passcode-input"]')
    const confirmInput = wrapper.find('input[data-ci="create-wallet-confirm-input"]')

    await passcodeInput.setValue('')
    await confirmInput.setValue('')
    expect(wrapper.html()).to.include('password is not valid.')

    await passcodeInput.setValue('ABC123')
    await confirmInput.setValue('123')
    expect(wrapper.html()).to.include('confirmation is not valid.')

    await confirmInput.setValue('ABC123')
    await flushPromises()

    expect(wrapper.html()).not.to.include('password is not valid.')
    expect(wrapper.html()).not.to.include('confirmation is not valid.')
  })

  it('a user will see validation errors for an invalid PIN', async () => {
    await router.isReady()
    const wrapper = mount(CreateWalletCreatePin, {
      global: {
        plugins: [router]
      }
    })

    const pinInput = wrapper.find('input[data-ci="create-wallet-pin-input"]')
    const confirmInput = wrapper.find('input[data-ci="create-wallet-confirm-input"]')

    await pinInput.setValue('')
    await confirmInput.setValue('')
    expect(wrapper.html()).to.include('pin is not valid.')

    await pinInput.setValue('4567')
    await confirmInput.setValue('9876')
    expect(wrapper.html()).to.include('confirmation is not valid.')

    await confirmInput.setValue('4567')
    await flushPromises()

    expect(wrapper.html()).not.to.include('pin is not valid.')
    expect(wrapper.html()).not.to.include('confirmation is not valid.')
  })
})
