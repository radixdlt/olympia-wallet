import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    validations: {
      default: '%{field} is invalid',
      required: '%{field} is required',
      confirmed: '%{field} do not match',
      length: '%{field} is the wrong length',
      max: '%{field} must be less than 160 characters long',
      validAddress: 'Enter a valid address',
      validValidator: 'Enter a valid validator',
      validAmount: 'Enter a valid amount',
      insufficientFunds: '%{field} cannot be greater than account balance',
      amountOfType: 'Requested amount to send is not a multiple of token granularity (%{granularity}), will be unable to send',
      invalidPin: 'Your pin was not a match. Try again.',
      incorrectPassword: 'Your password is incorrect. Try again.',
      greaterThanZero: 'Must be greater than 0',
      transactionFailed: 'Your transaction failed. Check that you have sufficient XRD to cover the transfer plus fee.',
      stakeFailed: 'Your transaction failed. Check that you have sufficient XRD to cover your stake plus fee.',
      unstakeFailed: 'Your transaction failed. Check that you are not unstaking more than your total current stake and that you have sufficient XRD to cover the fee.',
      pinMatch: 'Your new pin doesn\'t match'
    },
    home: {
      welcomeOne: 'Welcome to the Radix Olympia Desktop Wallet.',
      welcomeThree: 'Decentralized finance applications are currently being built on protocols that were not designed to meet the needs and requirements of DeFi.',
      welcomeFour: 'Radix is using our technology innovations to create the first layer 1 protocol specifically built to serve the rapidly growing DeFi world.',
      welcomeFive: 'Olympia is the first release of the Radix mainnet with the XRD token, dPoS staking, low fees, and a simplified form of our Cerberus consensus protocol. It provides the decentralized network foundations for our future releases that will introduce a DeFi-focused developer experience and unlimited scalability.',
      passwordTitle: 'Enter your password to access your wallet',
      passwordPlaceholder: 'enter password',
      passwordButton: 'Open Wallet',
      authenticating: 'Authenticating...',
      createTitle: 'I don\'t have a wallet yet.',
      createContent: 'You’re new to Radix. Create a new wallet to get started holding, sending, and staking XRD tokens.',
      createButton: 'Create a new wallet',
      restoreTitle: 'I already have a wallet.',
      restoreContent: 'You previously created a wallet and want to use your seed phrase to restore your access.',
      restoreButton: 'Restore a previous wallet',
      forgotPassword: 'I forgot my password',
      deleteWalletTitle: 'Do you want to delete your current wallet?',
      deleteWalletContent: 'If you can\'t remember your password, you\'ll need to delete this local wallet and restore from your seed phrase or create a new wallet.',
      deleteChoiceContent: 'Are you sure you want to proceed?',
      deleteRestoreButton: 'Delete and restore from seed phrase',
      deleteCreateButton: 'Delete and create a new wallet',
      deleteRestoreConfirm: 'Type DELETE AND RESTORE below to confirm',
      restoreConfirmButton: 'Yes, I\'m sure I want to delete my wallet',
      forgotPasswordExit: 'Nevermind, I remember my password'
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
      passwordButton: 'Confirm',
      pinTitle: 'PIN',
      pinHelpOne: 'Please enter a secure PIN. This will be used to verify all transactions made in the Wallet.',
      pinHelpTwo: 'Please confirm your PIN.',
      pinButton: 'Confirm PIN',
      startOver: 'Start Over',
      newPinLabel: 'Create your PIN',
      confirmPinLabel: 'Confirm your PIN'
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
      addAccount: '+ Add Account',
      chooseAnAccount: 'Choose an account:',
      balancesHeading: 'XRD Balances',
      additionalBalancesHeading: 'Additional Balances',
      currentAddress: 'Current Address:',
      totalTokens: 'Total',
      availableTokens: 'Available',
      stakedTokens: 'Staked or Unstaking',
      navBalances: 'Balances',
      navHistory: 'History',
      navTransaction: 'Send Tokens',
      navStake: 'Stake & Unstake',
      navSettings: 'Wallet Settings',
      navHelp: 'Help',
      navAddHWWallet: '+ Add Hardware Account',
      hardwareWalletHeading: 'Hardware Account',
      testNetworkDisclaimer: 'You are currently connected to a TEST NETWORK. To view your legitimate tokens and transactions on the Radix Public Network, you must choose "Mainnet" in Wallet Settings.',
      version: 'Version',
      network: 'Network',
      update: 'Update Available',
      disconnected: 'Disconnected'
    },
    history: {
      historyHeading: 'History',
      unstakeAction: 'Request Unstake',
      validatorLabel: 'Validator',
      receivedAction: 'Received',
      sentAction: 'Sent',
      toLabel: 'To',
      fromLabel: 'From',
      clickToDecryptLabel: 'Encrypted message, click to decrypt.',
      stakeAction: 'Stake',
      otherAction: 'Other',
      previous: 'Previous',
      next: 'Next',
      noHistory: 'Sorry, but you don\'t have transaction history for this account.'
    },
    transaction: {
      transactionHeading: 'Send Tokens',
      modalHeading: 'Confirm Transaction Details',
      toLabel: 'To',
      fromLabel: 'From',
      amountLabel: 'Amount',
      messageLabel: 'Message',
      feeLabel: 'Fee',
      cancelButton: 'Cancel Transaction',
      confirmButton: 'Confirm Transaction',
      sendButton: 'Send',
      insufficientFunds: 'Sorry, but you don\'t have any tokens to send!',
      warningTitle: 'Warning',
      lessThanTenXRDBalanceWarning: 'This transaction will leave you with less than 10 XRD. Remember that you must have XRD to pay fees to unstake and perform other transactions.',
      recipientPlaceholder: 'Enter address',
      amountPlaceholder: 'Available balance ...',
      messagePlaceholder: 'Add an optional message',
      enterPin: 'Enter PIN'
    },
    staking: {
      currentStakesHeading: 'Current Stakes',
      viewAllValidators: 'View all Validators',
      validatorWarning: 'This URL was provided by the node-runner and is unverified. Click at your own risk.',
      stakeTab: 'Stake Tokens',
      unstakeTab: 'Request Unstake',
      unstakingLabel: 'Unstaking',
      pendingStakeLabel: 'Pending Stake',
      stakedLabel: 'Staked',
      addButton: 'add stake',
      reduceButton: 'reduce stake',
      fromLabel: 'Staking Account',
      validatorLabel: 'Validator',
      amountLabel: 'Amount',
      amountPlaceholder: 'Available balance ...',
      feeLabel: 'Fee',
      stakeButton: 'Stake',
      unstakeButton: 'Request Unstake',
      stakeDisclaimer: 'Holders of XRD tokens may stake them to validator nodes of their choice to receive potential incentive rewards. Note that once XRD tokens are staked, unstaking cannot be requested for up to 2 hours, and {bold}. Please visit {link} for more information about staking, unstaking, and selecting good validator nodes. ',
      stakeDisclaimerBold: 'unstake requests will be subject to a lengthy delay before tokens are available',
      guideTitle: 'learn.radixdlt.com',
      unstakeDisclaimer: 'Your current stakes are shown at right. You may request an unstake of some or all of your XRD tokens from a validator. Once the request transaction has been processed, {bold}, after which they will become available for transfer once more. Please visit {link} for more information about unstaking.',
      unstakeDisclaimerBold: 'your tokens will be subject to a lengthy unstaking delay',
      availableBalancePlaceholder: 'Enter amount',
      validatorPlaceholder: 'Enter validator address',
      validatorFeeLabel: 'Validator Fee',
      recentUptimeLabel: 'Recent Uptime',
      unregistered: 'unregistered',
      noEmissions: 'no emissions'
    },
    confirmation: {
      transferFromLabel: 'Your address',
      transferToLabel: 'Send to',
      stakeFromLabel: 'Your address',
      stakeToLabel: 'Stake to',
      unstakeFromLabel: 'Your address',
      unstakeToLabel: 'Unstake from'
    },
    account: {
      editNameHeading: 'Let’s set the name of your account',
      nameInputPlaceholder: 'Name me!',
      updateNameButton: 'Save'
    },
    settings: {
      currentPinLabel: 'Enter current PIN',
      pinLabel: 'Enter new PIN',
      confirmationPinLabel: 'Confirm new PIN',
      mnemonicDisclaimer: 'Your seed phrase is a secret list of 12 words that uniquely provide access to your wallet. As long as you have them, you will always be able to recover access to your accounts within this wallet. You may view it here if you need to back it up for future recovery.',
      mnemonicDisclaimerTwo: 'This seed phrase grants full access to all accounts in your wallet!',
      mnemonicDisclaimerThree: 'Please do not view it in a public place, and remember to not store it digitally.',
      mnemonicModalHeading: 'Enter your password to access your seed phrase',
      accessMnemonicButton: 'Access Seed Phrase',
      accessMnemonicCancelPin: 'Cancel',
      resetPasswordDisclaimer: 'Your password is required each time you open the wallet application, and provides access to your secret seed phrase. We recommend you choose a strong, unguessable password that you have not used elsewhere.',
      resetPasswordInstructions: 'Please enter your current password before choosing a new one.',
      resetPinDisclaimer: 'Your PIN is required each time you wish to submit a transaction.',
      resetPinDisclaimerTwo: 'Please enter your password to change your PIN.',
      currentPasswordPlaceholder: 'Enter Current Password',
      currentPasswordLabel: 'Current password',
      newPasswordLabel: 'Enter New Password',
      confirmPasswordLabel: 'Confirm New Password',
      changePasswordLabel: 'Change password',
      passwordRequiredLabel: 'Enter your password',
      passwordPlaceholder: 'password',
      accessSettingsButton: 'Access Settings',
      updatedPassword: 'You\'ve successfully updated your password.',
      updatedPIN: 'You\'ve successfully updated your PIN.',
      nodeDisclaimer: 'Select the node that the Wallet will connect to, or add a new node of your choice. The choice of node also selects which network the Wallet will use.',
      nodeDisclaimerWarning: 'NOTE: Only the MAINNET network carries legitimate tokens and transactions for the Radix Public Network.',
      nodeAddressLabel: 'Archive Node Address',
      nodeNetworkLabel: 'Network',
      addCustomNodeLabel: 'Add Custom Node Address:',
      addNodeButton: 'add node',
      confirm: 'Confirm',
      confirmConnection: 'Connect to ',
      cancel: 'Cancel',
      switchingNetworks: 'Validating Connection...',
      takesTooLong: 'If this takes more than a few seconds, ',
      clickToRefresh: 'click here to refresh.',
      networkChangeTitle: 'Archive Node Change',
      networkChangeCopy: 'Please note that you will need to re-enter your password in order to switch networks. Do you wish to proceed?',
      mainnetUnavailableOne: 'Cannot currently connect to mainnet. Please check the ',
      mainnetUnavailableLink: 'status page',
      mainnetUnavailableTwo: ' for more information.'
    },
    errors: {
      hardwareMismatchTitle: 'Hardware Wallet Account Mismatch',
      hardwareMismatchCopyOne: 'The account provided by the connected hardware wallet device does not match your current hardware wallet account address. Ensure you are using the same hardware wallet device.',
      hardwareMismatchCopyTwo: 'If you would like to use a different hardware wallet device, please remove the existing hardware wallet account and add a new one with the desired device connected. You can always re-add a previous hardware wallet device account later.',
      genericErrorTitle: 'Oops, something unexpected happened',
      transactionBuildingErrorTitle: 'Something went wrong while building your transaction',
      transactionConfirmingErrorTitle: 'Something went wrong while confirming your transaction',
      transactionConfirmingErrorMsg: 'We suggest you reload your app and confirm that your transaction went through before trying again.',
      closeModal: 'Close',
      refreshApp: 'Refresh App',
      unableToPrepareTransferTransactionTitle: 'The transaction you’ve specified cannot be created. Possible reasons for this error include:',
      unableToPrepareTransferTransactionPointOne: 'Insufficient tokens in your account to send',
      unableToPrepareTransferTransactionPointTwo: 'Insufficient XRD to pay the required transaction fee',
      unableToPrepareStakingTransactionTitle: 'The transaction you’ve specified cannot be created. Possible reasons for this error include:',
      unableToPrepareStakingTransactionPointOne: 'Attempting to stake less than the 90 XRD stake minimum',
      unableToPrepareStakingTransactionPointTwo: 'Insufficient XRD to stake your desired amount',
      unableToPrepareStakingTransactionPointThree: 'Insufficient XRD to pay the required transaction fee',
      unableToPrepareUnstakingTransactionTitle: 'The transaction you’ve specified cannot be created. Possible reasons for this error include:',
      unableToPrepareUnstakingTransactionPointOne: 'Attempting to request an unstake in the same “epoch” (~30 min period) that you staked',
      unableToPrepareUnstakingTransactionPointTwo: 'Attempting to unstake more than you currently have staked to the validator',
      unableToPrepareUnstakingTransactionPointThree: 'Insufficient XRD to pay the required transaction fee'
    },
    apiErrors: {
      unknown: 'Unexpected Error',
      InvalidAccountAddressError: {
        message: 'The recipient Radix address specified is not valid.',
        title: 'Cannot Create Transaction'
      },
      InvalidValidatorAddressError: {
        message: 'The validator node address specified is not valid.',
        title: 'Cannot Complete Stake or Unstake'
      },
      NotEnoughNativeTokensForFeesError: {
        message: 'You do not have enough XRD to pay the required transaction fee',
        title: 'Cannot Create Transaction'
      },
      NotEnoughTokensForTransferError: {
        message: 'You do not have enough of the specified token for this transfer.',
        title: 'Cannot Create Transaction'
      },
      NotEnoughTokensForStakeError: {
        message: 'You do not have enough XRD for the requested stake.',
        title: 'Cannot Complete Stake'
      },
      NotEnoughTokensForUnstakeError: {
        requested: {
          message: 'You do not have enough XRD for the requested unstake.',
          title: 'Cannot Complete Unstake'
        },
        pending: {
          message: 'You must wait until the next epoch (approx. 30 minutes) before unstaking this quantity of XRD – %{pending} XRD are currently pending stake and cannot yet be unstaked.',
          title: 'Cannot Complete Unstake'
        }
      },
      BelowMinimumStakeError: {
        message: 'You must stake at least %{minimum} XRD.',
        title: 'Cannot Complete Stake'
      },
      CannotStakeError: {
        message: 'The specified validator node does not accept stake, other than from its owner.',
        title: 'Cannot Complete Stake'
      },
      MessageTooLongError: {
        message: 'The messages specified for the transaction is too long.',
        title: 'Cannot Create Transaction'
      }
    }
  }
}

export const i18n = createI18n({
  locale: 'en',
  legacy: false,
  globalInjection: true,
  messages
})
