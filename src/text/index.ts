import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    home: {
      welcomeOne: 'Welcome to the Radix Betanet.',
      welcomeTwo: 'Decentralized finance applications are currently being built on protocols that were not designed to meet the needs and requirements of DeFi services.',
      welcomeThree: 'Radix is using our significant technology innovations to be the first layer 1 protocol specifically built to serve the rapidly growing DeFi industry.',
      passwordTitle: 'Enter your password to access your wallet',
      passwordPlaceholder: 'enter password',
      passwordButton: 'Open Wallet',
      createTitle: 'I don\'t have a wallet yet!',
      createContent: 'You’re new to Radix, create a new wallet to get started holding, sending, and staking XRD.',
      createButton: 'Create a new wallet',
      restoreTitle: 'I already have a wallet',
      restoreContent: 'You have an existing wallet and know your recovery password or have a hardware wallet start here.',
      restoreButton: 'Restore a previous wallet'
    },
    createWallet: {
      recoveryTitle: 'Recovery Phrase',
      recoveryHelpOne: 'The following 12 words are the seed of your new account. As long as you have them, you will always be able to recover your account, but remember not to store them digitally.',
      recoveryButtonOne: 'I\'ve written down my recovery phrase',
      recoveryHelpTwo: 'Please enter your 12-word mnemonic. The words must be in the correct order.',
      recoveryButtonTwoDisabled: 'Fill these out first',
      recoveryButtonTwoEnabled: 'I\'ve done it!',
      passwordTitle: 'Password',
      passwordHelp: 'Please enter a secure password here.  This password secures your mnemonicly generated key, and will be required every time you open this application',
      passwordPlaceholder: 'enter password',
      passwordConfirmationPlaceholder: 'confirm password',
      passwordButton: 'Confirm password',
      pinTitle: 'PIN',
      pinHelpOne: 'Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.',
      pinHelpTwo: 'Please confirm your PIN.',
      pinButton: 'Confirm PIN'
    },
    restoreWallet: {
      recoveryTitle: 'Recovery Phrase',
      recoveryHelp: 'Enter your 12 word mnemonic to restore your wallet.',
      recoveryButtonDisabled: 'Fill these out first',
      recoveryButtonEnabled: 'I\'ve done it!',
      passwordTitle: 'Password',
      passwordHelp: 'Please enter a secure password here. This password secures your mnemonicly generated key, and will be required every time you open this application',
      pinTitle: 'PIN',
      pinHelpOne: 'Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.',
      pinHelpTwo: 'Please confirm your PIN.'
    },
    wallet: {
      addressLabel: 'addr:',
      back: 'back',
      addAccount: 'Add Account',
      balancesHeading: 'XRD Balances',
      additionalBalancesHeading: 'Additional Balances',
      copyAddress: 'Copy Address',
      totalTokens: 'Total',
      availableTokens: 'Available',
      stakedTokens: 'Staked',
      navBalances: 'Balances',
      navHistory: 'History'
    },
    history: {
      historyHeading: 'History',
      unstakeAction: 'Unstake',
      validatorLabel: 'Validator',
      receivedAction: 'Received',
      sentAction: 'Sent',
      toLabel: 'To',
      fromLabel: 'From',
      stakeAction: 'Stake',
      otherAction: 'Other'
    }
  }
}

export const i18n = createI18n({
  locale: 'en',
  messages
})
