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
      amountOfType: 'Requested amount to send is not a mulltiple of token granularity (%{granularity}), will be unable to send',
      invalidPin: 'Your pin was not a match. Try again.',
      incorrectPassword: 'Your password is incorrect. Try again.',
      greaterThanZero: 'Must be greater than 0'
    },
    home: {
      welcomeOne: 'Welcome to the Radix Olympia Desktop Wallet.',
      welcomeTwo: 'Betanet Version.',
      welcomeThree: 'Decentralized finance applications are currently being built on protocols that were not designed to meet the needs and requirements of DeFi.',
      welcomeFour: 'Radix is using our technology innovations to create the first layer 1 protocol specifically built to serve the rapidly growing DeFi world.',
      welcomeFive: 'Olympia is the first release of the Radix mainnet with the XRD token, dPoS staking, low fees, and a simplified form of our Cerberus consensus protocol. It provides the decentralized network foundations for our future releases that will introduce a DeFi-focused developer experience and unlimited scalability.',
      passwordTitle: 'Enter your password to access your wallet',
      passwordPlaceholder: 'enter password',
      passwordButton: 'Open Wallet',
      createTitle: 'I don\'t have a wallet yet',
      createContent: 'You’re new to Radix. Create a new wallet to get started holding, sending, and staking XRD tokens.',
      createButton: 'Create a new wallet',
      restoreTitle: 'I already have a wallet.',
      restoreContent: 'You previously created a wallet and want to use your seed phrase to restore your access.',
      restoreButton: 'Restore a previous wallet'
    },
    createWallet: {
      recoveryTitle: 'Seed Phrase',
      recoveryHelpOne: 'The following 12 words are the seed of your new account. As long as you have them, you will always be able to recover your account, but remember not to store them digitally.',
      recoveryButtonOne: 'I\'ve written down my seed phrase',
      recoveryHelpTwo: 'Please enter your 12-word seed phrase. The words must be in the correct order.',
      recoveryButtonTwoDisabled: 'Fill these out first',
      recoveryButtonTwoEnabled: 'I\'ve done it!',
      passwordTitle: 'Password',
      passwordHelp: 'Please enter a secure password here. This password secures your seed phrase, and will be required every time you open this application.',
      passwordPlaceholder: 'enter password',
      passwordConfirmationPlaceholder: 'confirm password',
      passwordButton: 'Confirm password',
      pinTitle: 'PIN',
      pinHelpOne: 'Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.',
      pinHelpTwo: 'Please confirm your PIN.',
      pinButton: 'Confirm PIN',
      startOver: 'Start Over'
    },
    restoreWallet: {
      recoveryTitle: 'Seed Phrase',
      recoveryHelp: 'Enter your 12 word seed phrase to restore your wallet.',
      recoveryButtonDisabled: 'Fill these out first',
      recoveryButtonEnabled: 'I\'ve done it!',
      passwordTitle: 'Password',
      passwordHelp: 'Please enter a secure password here. This password secures your mnemonicly generated key, and will be required every time you open this application',
      pinTitle: 'PIN',
      pinHelpOne: 'Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.',
      pinHelpTwo: 'Please confirm your PIN.'
    },
    wallet: {
      addressLabel: 'Address:',
      back: 'back',
      addAccount: 'Add Account',
      balancesHeading: 'XRD Balances',
      additionalBalancesHeading: 'Additional Balances',
      currentAddress: 'Current Address:',
      totalTokens: 'Total',
      availableTokens: 'Available',
      stakedTokens: 'Staked',
      navBalances: 'Balances',
      navHistory: 'History',
      navTransaction: 'Send Tokens',
      navStake: 'Stake & Unstake',
      navSettings: 'Wallet Settings',
      navHelp: 'Help'
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
      otherAction: 'Other',
      previous: 'Previous',
      next: 'Next'
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
      insufficientFunds: 'Sorry, but you don\'t have any tokens to send!',
      recipientPlaceholder: 'enter address',
      amountPlaceholder: 'Available balance ...',
      messagePlaceholder: 'Add an optional message'
    },
    staking: {
      currentStakesHeading: 'Current Stakes',
      stakeTab: 'Stake Tokens',
      unstakeTab: 'Unstake Tokens',
      unstakingLabel: 'Unstaking',
      addButton: 'Add',
      reduceButton: 'Reduce',
      fromLabel: 'Staking Account',
      validatorLabel: 'Validator',
      amountLabel: 'Amount',
      feeLabel: 'Fee',
      stakeButton: 'Stake',
      unstakeButton: 'Request Unstake',
      stakeDisclaimer: 'Holders of XRD tokens may stake them to validator nodes of their choice to receive potential incentive rewards. Note that once XRD tokens are staked, unstaking them again will be subject to a lengthy unstaking delay. Please visit http://learn.radixdlt.com for more information about staking, unstaking, and selecting good validator nodes.',
      unstakeDisclaimer: 'Your current stakes are shown at right. You may request an unstake of some or all of your XRD tokens from a validator. Once the request transaction has been processed, your tokens will be subject to a lengthy unstaking delay, after which they will become available for transfer once more. Please visit http://learn.radixdlt.com for more information about unstaking.',
      availableBalancePlaceholder: 'Available balance ...',
      validatorPlaceholder: 'enter validator address'
    },
    account: {
      editNameHeading: 'Let’s set the name of your account',
      nameInputPlaceholder: 'Name me!',
      updateNameButton: 'Save'
    },
    settings: {
      currentPinLabel: 'enter current PIN',
      pinLabel: 'enter new PIN',
      confirmationPinLabel: 'confirm new PIN',
      mnemonicDisclaimer: 'Your seed phrase is a secret list of 12 words that uniquely provide access to your wallet. As long as you have them, you will always be able to recover access to your accounts within this wallet. You may view it here if you need to back it up for future recovery.',
      mnemonicDisclaimerTwo: 'This seed phrase grants full access to all accounts in your wallet!',
      mnemonicDisclaimerThree: 'Please do not view it in a public place, and remember to not store it digitally.',
      mnemonicModalHeading: 'Enter your pin to access your seed phrase',
      accessMnemonicButton: 'Access Seed Phrase',
      resetPasswordDisclaimer: 'Your password is required each time you open the wallet application, and provides access to your secret seed phrase. We recommend you choose a strong, unguessable password that you have not used elsewhere.',
      resetPasswordInstructions: 'Please enter your current password before choosing a new one.',
      resetPinDisclaimer: 'Your PIN is required each time you wish to submit a transaction.',
      resetPinDisclaimerTwo: 'Please enter your current PIN before choosing a new one.'
    }
  }
}

export const i18n = createI18n({
  locale: 'en',
  messages
})
