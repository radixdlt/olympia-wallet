import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    validations: {
      default: '%{field} is invalid',
      required: '%{field} is required',
      confirmed: '%{field} doesn\'t match',
      length: '%{field} is the wrong length',
      validAddress: 'Enter a valid address',
      validAmount: 'Enter a valid amount',
      insufficientFunds: '%{field} cannot be greater than account balance',
      amountOfType: 'Requested amount to send is not a mulltiple of token granularity (%{granularity}), will be unable to send'
    },
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
      navHistory: 'History',
      navTransaction: 'Send Tokens',
      navStake: 'Stake & Unstake'
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
    },
    transaction: {
      transactionHeading: 'Send Tokens',
      modalHeading: 'Confirm Transaction Details',
      toLabel: 'To',
      fromLabel: 'From',
      amountLabel: 'Amount',
      messageLabel: 'Message',
      feeLabel: 'Fee',
      cancelButton: 'Cancel',
      confirmButton: 'Confirm',
      sendButton: 'Send',
      insufficientFunds: 'Sorry, but you don\'t have any tokens to send!'
    },
    staking: {
      currentStakesHeading: 'Current Stakes',
      stakeTab: 'Stake',
      unstakeTab: 'Unstake',
      unstakingLabel: 'Unstaking',
      addButton: 'Add',
      reduceButton: 'Reduce',
      fromLabel: 'Staking Account',
      validatorLabel: 'Validator',
      amountLabel: 'Amount',
      feeLabel: 'Fee',
      stakeButton: 'Stake',
      unstakeButton: 'Request Unstake',
      stakeDisclaimer: 'WRITE STAKE COPY Network health explainer with link to FAQ and Validator link, short paragraph. dit diam. Maecenas malesuada tortor turpis, vitae mollis magna elementunas malesuada tortor turpis, vitae mollis magna elementum in. Proin rhoncus vulputate erat, eget aliquam lacus dignissim vel.',
      unstakeDisclaimer: 'WRITE UNSTAKE COPY Network health explainer with link to FAQ and Validator link, short paragraph. dit diam. Maecenas malesuada tortor turpis, vitae mollis magna elementunas malesuada tortor turpis, vitae mollis magna elementum in. Proin rhoncus vulputate erat, eget aliquam lacus dignissim vel.',
      availableBalancePlaceholder: 'Available balance ...',
      validatorPlaceholder: 'enter validator address'
    },
    account: {
      editNameHeading: 'Let’s set the name of your account',
      nameInputPlaceholder: 'Name me!',
      updateNameButton: 'Save'
    }
  }
}

export const i18n = createI18n({
  locale: 'en',
  messages
})
