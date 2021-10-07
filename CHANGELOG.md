# Changelog

### [1.2.3](https://www.github.com/radixdlt/olympia-wallet/compare/v1.2.2...v1.2.3) (2021-09-28)


### Bug Fixes

* make rri address scroll with token balance ([#345](https://www.github.com/radixdlt/olympia-wallet/issues/345)) ([abe88c0](https://www.github.com/radixdlt/olympia-wallet/commit/abe88c0d630e591706166bf4052bbc66d8759687))


### Dependencies

* Enable Latest Builds ([#344](https://www.github.com/radixdlt/olympia-wallet/issues/344)) ([1e24dcd](https://www.github.com/radixdlt/olympia-wallet/commit/1e24dcd01ea9ed85503a32c73a383bb7c0718b82))
* update switching node modal copy ([#346](https://www.github.com/radixdlt/olympia-wallet/issues/346)) ([740a3af](https://www.github.com/radixdlt/olympia-wallet/commit/740a3af7bf1559a70583c6639b08bfc2aafa8d10))

### [1.2.2](https://www.github.com/radixdlt/olympia-wallet/compare/v1.2.1...v1.2.2) (2021-09-24)


### Bug Fixes

* disable release-latest ([#341](https://www.github.com/radixdlt/olympia-wallet/issues/341)) ([041a80b](https://www.github.com/radixdlt/olympia-wallet/commit/041a80b2b6e78ae59978690f1c55466d4e4030b0))

### [1.2.1](https://www.github.com/radixdlt/olympia-wallet/compare/v1.2.0...v1.2.1) (2021-09-24)


### Bug Fixes

* show the selected currency in the conf modal ([#339](https://www.github.com/radixdlt/olympia-wallet/issues/339)) ([72f29db](https://www.github.com/radixdlt/olympia-wallet/commit/72f29db4debda044e2c62b3afe6eb4a80a224a4b))

## [1.2.0](https://www.github.com/radixdlt/olympia-wallet/compare/v1.1.1...v1.2.0) (2021-09-23)


### Features

* add exponential backoff to tx history retries ([#314](https://www.github.com/radixdlt/olympia-wallet/issues/314)) ([dc42296](https://www.github.com/radixdlt/olympia-wallet/commit/dc422965a1cd4c38f620798ad3032bed45f36a91))
* After changing networks, hard reset the wallet ([#325](https://www.github.com/radixdlt/olympia-wallet/issues/325)) ([29d3e77](https://www.github.com/radixdlt/olympia-wallet/commit/29d3e7778711106c35a8c1ec0af7741a5d0fc257))
* also disable change pin when no connection ([#330](https://www.github.com/radixdlt/olympia-wallet/issues/330)) ([2bdb09b](https://www.github.com/radixdlt/olympia-wallet/commit/2bdb09ba64a1432d3df6fe168288827097b1651c))
* Changing nodes should be confirmed ([#328](https://www.github.com/radixdlt/olympia-wallet/issues/328)) ([4a42f5c](https://www.github.com/radixdlt/olympia-wallet/commit/4a42f5c87dcc5269a566c34de786a4be009f4dd5))
* Expand network switch confirmation modal ([#332](https://www.github.com/radixdlt/olympia-wallet/issues/332)) ([dcd5886](https://www.github.com/radixdlt/olympia-wallet/commit/dcd5886313783d5dfa4948322226ccf1bd9898d2))
* hardware wallet -> hardware account ([#329](https://www.github.com/radixdlt/olympia-wallet/issues/329)) ([76a3b7b](https://www.github.com/radixdlt/olympia-wallet/commit/76a3b7b59b91bb4bde6fe9bf4dcdccb0e152f6b2))
* If a user logs in and cannot connect to their node, redirect them to settings ([#301](https://www.github.com/radixdlt/olympia-wallet/issues/301)) ([18d3f24](https://www.github.com/radixdlt/olympia-wallet/commit/18d3f244c8565465b3bd45b05027c6714a323f56))
* show non xrd tokens in wallet ([332273e](https://www.github.com/radixdlt/olympia-wallet/commit/332273efbc3f3d91db6e74848b890840169e60f6))


### Bug Fixes

* add tooltip text upon hovering over Validator Name ([#273](https://www.github.com/radixdlt/olympia-wallet/issues/273)) ([c9f9705](https://www.github.com/radixdlt/olympia-wallet/commit/c9f970586ccaa478b9f59e54048367a9abb0a8d9))
* Change Password and Reveal Seed settings tabs should be disabled without an active network connection ([#315](https://www.github.com/radixdlt/olympia-wallet/issues/315)) ([0cdb72f](https://www.github.com/radixdlt/olympia-wallet/commit/0cdb72fa31a1f9d4a0aed789b21c6620ec8ca498))
* correct pin change button title ([1c191ed](https://www.github.com/radixdlt/olympia-wallet/commit/1c191ed0af002da54811870ce52687b6c19600fb))
* correctly highlight active account ([#333](https://www.github.com/radixdlt/olympia-wallet/issues/333)) ([9885856](https://www.github.com/radixdlt/olympia-wallet/commit/9885856850e7eecb3ade00c6398b5a87dceec37d))
* correctly present build errors on Transaction and Stake/Unstake screens ([#317](https://www.github.com/radixdlt/olympia-wallet/issues/317)) ([b163a32](https://www.github.com/radixdlt/olympia-wallet/commit/b163a323e6475130a6b296edd6379b41f7542a6d))
* Don’t override existing values in wallet.json in initial migration ([#318](https://www.github.com/radixdlt/olympia-wallet/issues/318)) ([1403aa6](https://www.github.com/radixdlt/olympia-wallet/commit/1403aa6aab2d614bd5eb7e2298e77eb3a1a3b39b))
* Handle case where user wants to copy hardware wallet from verify modal ([37f8c47](https://www.github.com/radixdlt/olympia-wallet/commit/37f8c47a5c100b5f961cd3693172203c3b070ad1))
* Hide token balances after the active account has changed ([#327](https://www.github.com/radixdlt/olympia-wallet/issues/327)) ([0bc12f4](https://www.github.com/radixdlt/olympia-wallet/commit/0bc12f4cd22f7f76c39f286ecf7f4091b6b58a12))
* Include href to status page ([#322](https://www.github.com/radixdlt/olympia-wallet/issues/322)) ([c76d6e5](https://www.github.com/radixdlt/olympia-wallet/commit/c76d6e56beaaa2ccabbf69a92553254926a3c5d0))
* make subs a const, fix linting ([#326](https://www.github.com/radixdlt/olympia-wallet/issues/326)) ([0677757](https://www.github.com/radixdlt/olympia-wallet/commit/067775742d59b66583750e6aafb8ea35f2af1ce8))
* migration should represent full shape of wallet store before manipulating values ([3d9ffdb](https://www.github.com/radixdlt/olympia-wallet/commit/3d9ffdbcd367a32e240e7b3524c8604a9afbd8b2))
* Network connection is required for creating or restoring ([#316](https://www.github.com/radixdlt/olympia-wallet/issues/316)) ([ace1b17](https://www.github.com/radixdlt/olympia-wallet/commit/ace1b17321198016ad92f26e2ef51bbab6a753f1))
* Network specific account indexes and hardware addresses ([#297](https://www.github.com/radixdlt/olympia-wallet/issues/297)) ([36a2a48](https://www.github.com/radixdlt/olympia-wallet/commit/36a2a4818ae01311d275e75e456a1fe00042c739))
* overflow-x was overriding y axis and cropping tooltip ([5030a21](https://www.github.com/radixdlt/olympia-wallet/commit/5030a2145eede37bca06b04c05d3f087a8f1ef5a))
* re-enable button after invalid password ([#336](https://www.github.com/radixdlt/olympia-wallet/issues/336)) ([49d9eaa](https://www.github.com/radixdlt/olympia-wallet/commit/49d9eaa2eae99c725819873f92e2dfadf6911dca))
* Refactor old  from the wallet views linked to ledger integrations ([#305](https://www.github.com/radixdlt/olympia-wallet/issues/305)) ([7551d62](https://www.github.com/radixdlt/olympia-wallet/commit/7551d62ffcba1c284073372955e220840bb422f0))
* Regressions in password error messages and forgot password submission ([#284](https://www.github.com/radixdlt/olympia-wallet/issues/284)) ([b5e374f](https://www.github.com/radixdlt/olympia-wallet/commit/b5e374f55de2008873b7320ea7d227999796db2d))
* Release should use uppercased network ids ([#302](https://www.github.com/radixdlt/olympia-wallet/issues/302)) ([c8056d9](https://www.github.com/radixdlt/olympia-wallet/commit/c8056d92c163bf1c4b61be3375402e0040182710))
* render confirmation modal without errors ([#335](https://www.github.com/radixdlt/olympia-wallet/issues/335)) ([5597efd](https://www.github.com/radixdlt/olympia-wallet/commit/5597efd588506ba732529b7863dbd8a647a92635))
* rewire ledger interactions ([#303](https://www.github.com/radixdlt/olympia-wallet/issues/303)) ([7caa2a4](https://www.github.com/radixdlt/olympia-wallet/commit/7caa2a439f79db6ff31ba2c164ac3003a689ab49))
* Show Word Numbers when revealing the seed phrase in settings ([#286](https://www.github.com/radixdlt/olympia-wallet/issues/286)) ([d79b591](https://www.github.com/radixdlt/olympia-wallet/commit/d79b59146b3eb5ce0cfd870d8363357aa9c1df96))
* Staking transactions should reference nativeToken not selectedCurrency ([#304](https://www.github.com/radixdlt/olympia-wallet/issues/304)) ([db8bf24](https://www.github.com/radixdlt/olympia-wallet/commit/db8bf244c6632e1072a0b766507b1298accefc1b))
* the cancel button should close tx conf modal ([#312](https://www.github.com/radixdlt/olympia-wallet/issues/312)) ([8b96e49](https://www.github.com/radixdlt/olympia-wallet/commit/8b96e49e50e7e098c59bbd7c56eb6cb1705289b4))
* Transaction Currency Selector wasn't working ([#298](https://www.github.com/radixdlt/olympia-wallet/issues/298)) ([4858023](https://www.github.com/radixdlt/olympia-wallet/commit/485802352d392fb16bf1dea29301da0988704756))
* Use RXJS to directly query the API for token balances ([#337](https://www.github.com/radixdlt/olympia-wallet/issues/337)) ([3bc74ff](https://www.github.com/radixdlt/olympia-wallet/commit/3bc74ffc453d9a50da90f1a7802b7654949565c6))


### Dependencies

* Add message when Mainnet is unavailable ([#334](https://www.github.com/radixdlt/olympia-wallet/issues/334)) ([e5dd874](https://www.github.com/radixdlt/olympia-wallet/commit/e5dd87487548d20a1dd23d2e44b8d4176a9c1868))
* Add refresh option when switching networks takes a long time ([#323](https://www.github.com/radixdlt/olympia-wallet/issues/323)) ([958a79e](https://www.github.com/radixdlt/olympia-wallet/commit/958a79e598aecf8220073a2dae186387c5daf61d))
* Combine Radix and Wallet composables ([#300](https://www.github.com/radixdlt/olympia-wallet/issues/300)) ([9112ea9](https://www.github.com/radixdlt/olympia-wallet/commit/9112ea9fc88b3096dc25a51cb5fa90be639a43d6))
* Composable Refactor / Network Selection ([#290](https://www.github.com/radixdlt/olympia-wallet/issues/290)) ([aa6734d](https://www.github.com/radixdlt/olympia-wallet/commit/aa6734d565f42a1181f4cd82371017afbfc2a826))
* correct unstaking label size ([e8e4d14](https://www.github.com/radixdlt/olympia-wallet/commit/e8e4d14138a737babc3acdd780cd21ffdcf5d8f0))
* Explorer urls should be reactive to the active network ([52a0889](https://www.github.com/radixdlt/olympia-wallet/commit/52a0889fa0c73c6ab22746bb975a98cd069a93f2))
* Expose invalid password error on login ([ba2d688](https://www.github.com/radixdlt/olympia-wallet/commit/ba2d68839f799ae8e095001ef88355f1b5f98228))
* final 1.2.0 release tweaks ([#338](https://www.github.com/radixdlt/olympia-wallet/issues/338)) ([3dee6e1](https://www.github.com/radixdlt/olympia-wallet/commit/3dee6e11b4950cf6a1cd9c857dc30a9f30fe1515))
* increase all polling from 5s to 15s ([a0b1e2a](https://www.github.com/radixdlt/olympia-wallet/commit/a0b1e2a3bc41550b8f3f4ed4b8c1155f3289344e))
* Mainnet should appear before Stokenet ([fe86a7a](https://www.github.com/radixdlt/olympia-wallet/commit/fe86a7a96c054b282c0870468a35a06f5e72daa6))
* More neatly handle invalid password now that users login without network connection ([c486d2f](https://www.github.com/radixdlt/olympia-wallet/commit/c486d2f1b665a14b7ecc6c164318a087d0f91a09))
* Report invalid url validation for non url strings ([#331](https://www.github.com/radixdlt/olympia-wallet/issues/331)) ([387f722](https://www.github.com/radixdlt/olympia-wallet/commit/387f722488ba737ae6e1f6632f275e32170d58da))
* Show disclaimer if not on Mainnet network ([77ce653](https://www.github.com/radixdlt/olympia-wallet/commit/77ce6531fd2bd40f73804892f105259236f83a2b))
* temporarily, latest builds target stokent ([#294](https://www.github.com/radixdlt/olympia-wallet/issues/294)) ([061bb6a](https://www.github.com/radixdlt/olympia-wallet/commit/061bb6a95692e9aa8417ca504dd3334b9c8dbe83))
* update styling of non-xrd balances ([#313](https://www.github.com/radixdlt/olympia-wallet/issues/313)) ([cee4404](https://www.github.com/radixdlt/olympia-wallet/commit/cee4404951127a2076cb09e80dc8b124f70b186e))
* update styling of the non-mainnet warning ([914dbe0](https://www.github.com/radixdlt/olympia-wallet/commit/914dbe0a4925192d55ebf4d864aabd1e60028284))
* update styling of Wallet Overview page ([160c874](https://www.github.com/radixdlt/olympia-wallet/commit/160c87455c140c33e4ea2e2b7da4894284ac6165))

### [1.1.1](https://www.github.com/radixdlt/olympia-wallet/compare/v1.1.0...v1.1.1) (2021-08-12)


### Bug Fixes

* Hardware Wallet account derivation ([#278](https://www.github.com/radixdlt/olympia-wallet/issues/278)) ([abd03d2](https://www.github.com/radixdlt/olympia-wallet/commit/abd03d259269ff5160679b89b9bdf08592c86d46))


### Dependencies

* show error when new hw address added ([#281](https://www.github.com/radixdlt/olympia-wallet/issues/281)) ([c5a1da8](https://www.github.com/radixdlt/olympia-wallet/commit/c5a1da83bbdabf5cb6bfb028bcbe67aa951fd954))

## [1.1.0](https://www.github.com/radixdlt/olympia-wallet/compare/v1.0.1...v1.1.0) (2021-08-06)


### Features

* On suspend, stop polling and send user home ([#271](https://www.github.com/radixdlt/olympia-wallet/issues/271)) ([9997aca](https://www.github.com/radixdlt/olympia-wallet/commit/9997aca994cbf233f19e3282239888fce55b6102))
* The confirmation modal should submit on Enter, and Cancel on Escape. ([#268](https://www.github.com/radixdlt/olympia-wallet/issues/268)) ([1860a9c](https://www.github.com/radixdlt/olympia-wallet/commit/1860a9ca6bbb1fd76e9bdbdd30c295cddfff5c37))


### Bug Fixes

* prevent error on send screen when no balances ([#276](https://www.github.com/radixdlt/olympia-wallet/issues/276)) ([b9831d9](https://www.github.com/radixdlt/olympia-wallet/commit/b9831d97c015afdd349a9f38cf1cc12dfc44f4f9))
* Remove error handling for the completion event on transaction tracking ([584a733](https://www.github.com/radixdlt/olympia-wallet/commit/584a733e6210ef4bfb86f36a2c50efbe0fb5b746))
* Transaction Error Handling Regression ([#264](https://www.github.com/radixdlt/olympia-wallet/issues/264)) ([806d26e](https://www.github.com/radixdlt/olympia-wallet/commit/806d26ed6c28fddd1387f7b4c9129199e3fe3557))
* validate network addresses for active network ([#267](https://www.github.com/radixdlt/olympia-wallet/issues/267)) ([0fe7bb7](https://www.github.com/radixdlt/olympia-wallet/commit/0fe7bb7dcb44a52840b9efda2418ae4bb0543e9c))
* Validate password input when pasting string ([#272](https://www.github.com/radixdlt/olympia-wallet/issues/272)) ([e03bc08](https://www.github.com/radixdlt/olympia-wallet/commit/e03bc08a9d3fc903363a9211969d7ead37c6b902))


### Dependencies

* add txhistory retry ([#274](https://www.github.com/radixdlt/olympia-wallet/issues/274)) ([8c4d541](https://www.github.com/radixdlt/olympia-wallet/commit/8c4d54195e169a7668477119c2283dea43596f0f))
* improve how we handle network selection ([#266](https://www.github.com/radixdlt/olympia-wallet/issues/266)) ([3cbc2f7](https://www.github.com/radixdlt/olympia-wallet/commit/3cbc2f7b6ad7bdb89034b00a55e86b60c7c5dd53))

### [1.0.1](https://www.github.com/radixdlt/olympia-wallet/compare/v1.0.0...v1.0.1) (2021-07-28)


### Dependencies

* remove a betanet tag we somehow missed. ([#262](https://www.github.com/radixdlt/olympia-wallet/issues/262)) ([826f4d3](https://www.github.com/radixdlt/olympia-wallet/commit/826f4d3482c44754722ce33de3830c07910b31a4))

## [1.0.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.13...v1.0.0) (2021-07-28)


### ⚠ BREAKING CHANGES

* Release 1.0.0 (#260)

### Features

* Release 1.0.0 ([#260](https://www.github.com/radixdlt/olympia-wallet/issues/260)) ([c3261ed](https://www.github.com/radixdlt/olympia-wallet/commit/c3261ed95e17dd9f118ce5cf172c06754880de2d))

### [0.14.13](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.12...v0.14.13) (2021-07-28)


### Dependencies

* prepare for mainnet ([230fcca](https://www.github.com/radixdlt/olympia-wallet/commit/230fccaa2e10c7a8ab3f417186d32f09921e4fa1))

### [0.14.12](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.11...v0.14.12) (2021-07-27)


### Dependencies

* Add Apache 2.0 license ([#254](https://www.github.com/radixdlt/olympia-wallet/issues/254)) ([fd1ea6b](https://www.github.com/radixdlt/olympia-wallet/commit/fd1ea6be9ddef9754b9514df555823cd9ceb916d))

### [0.14.11](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.10...v0.14.11) (2021-07-27)


### Bug Fixes

* Wallet Staking Items on max size windows ([5b4ada3](https://www.github.com/radixdlt/olympia-wallet/commit/5b4ada3254035aa5463e60da4d031f8678b42a6d))

### [0.14.10](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.9...v0.14.10) (2021-07-27)


### ⚠ BREAKING CHANGES

* prepare for maininet

### Features

* prepare for maininet ([26475ad](https://www.github.com/radixdlt/olympia-wallet/commit/26475ad3c2b58174cec7fa54e3e17e6583d0eeec))


### Dependencies

* release 0.14.10 ([3a335b8](https://www.github.com/radixdlt/olympia-wallet/commit/3a335b8f3b0eaccfb3ae9f1d4d0c2eee0796dac0))

### [0.14.9](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.8...v0.14.9) (2021-07-27)


### Bug Fixes

* Manually trigger release ([#245](https://www.github.com/radixdlt/olympia-wallet/issues/245)) ([409cf3c](https://www.github.com/radixdlt/olympia-wallet/commit/409cf3c7c2d1028d93d4ac56ca933165168d1158))

### [0.14.8](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.7...v0.14.8) (2021-07-27)


### Bug Fixes

* Include zip file in mac electron-builder targets ([#242](https://www.github.com/radixdlt/olympia-wallet/issues/242)) ([e0c0b77](https://www.github.com/radixdlt/olympia-wallet/commit/e0c0b77e280f7f2cb9bcb9e6fc83fc8d67fd793c))
* wallet stake list styling updates ([#241](https://www.github.com/radixdlt/olympia-wallet/issues/241)) ([d47b633](https://www.github.com/radixdlt/olympia-wallet/commit/d47b6333f6b0d699c43cfe0535f58c427945f9f2))


### Dependencies

* Tooltip updates ([#244](https://www.github.com/radixdlt/olympia-wallet/issues/244)) ([e2c2e47](https://www.github.com/radixdlt/olympia-wallet/commit/e2c2e478e65a3b0cd83490ccdd8f45240ab469ae))

### [0.14.7](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.6...v0.14.7) (2021-07-27)


### Features

* forget hardware wallet ([#238](https://www.github.com/radixdlt/olympia-wallet/issues/238)) ([6a90012](https://www.github.com/radixdlt/olympia-wallet/commit/6a900129744327bc6e4b5ef9d7d4b02918c4853f))


### Bug Fixes

* Confirmation Modal should show warnings about the ledger not being connected for hardware wallets ([#236](https://www.github.com/radixdlt/olympia-wallet/issues/236)) ([9d9deb0](https://www.github.com/radixdlt/olympia-wallet/commit/9d9deb0807753e376481a33ba12fee756e1925a7))


### Dependencies

* reduce overview balance font size ([#239](https://www.github.com/radixdlt/olympia-wallet/issues/239)) ([e490a4e](https://www.github.com/radixdlt/olympia-wallet/commit/e490a4e6a67a6ec52710bb8b99ca6928237316c7))
* Remove all the testnet ([#240](https://www.github.com/radixdlt/olympia-wallet/issues/240)) ([3364af3](https://www.github.com/radixdlt/olympia-wallet/commit/3364af3ec325e836b3de8f1e98d490c15f855a2f))

### [0.14.6](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.5...v0.14.6) (2021-07-26)


### Bug Fixes

* correct hardware address display ([#234](https://www.github.com/radixdlt/olympia-wallet/issues/234)) ([634af0a](https://www.github.com/radixdlt/olympia-wallet/commit/634af0a80c595b59ebe085ceff87b031d647fb90))
* Remove .app mac builds, produce DMGs only ([#233](https://www.github.com/radixdlt/olympia-wallet/issues/233)) ([2c7ed26](https://www.github.com/radixdlt/olympia-wallet/commit/2c7ed26902dabf4043ce5676a1e1c17a35e9d190))

### [0.14.5](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.4...v0.14.5) (2021-07-26)


### Dependencies

* Revent hardware connection events & enforce certs ([#229](https://www.github.com/radixdlt/olympia-wallet/issues/229)) ([bdf3f5b](https://www.github.com/radixdlt/olympia-wallet/commit/bdf3f5ba2a59a9987e75b52221192efb98c3afed))
* Update min stake copy for Mainnet ([#230](https://www.github.com/radixdlt/olympia-wallet/issues/230)) ([56a8cc0](https://www.github.com/radixdlt/olympia-wallet/commit/56a8cc0ad995012dac79d179c238725e94b1fd4f))

### [0.14.4](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.3...v0.14.4) (2021-07-26)


### Dependencies

* remove version.txt ([#224](https://www.github.com/radixdlt/olympia-wallet/issues/224)) ([d0a4357](https://www.github.com/radixdlt/olympia-wallet/commit/d0a435794bb462781cb32855954f0940c4ba8467))

### [0.14.3](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.2...v0.14.3) (2021-07-26)


### Bug Fixes

* unsubscribe from usb events before quit ([#222](https://www.github.com/radixdlt/olympia-wallet/issues/222)) ([80213e2](https://www.github.com/radixdlt/olympia-wallet/commit/80213e266e47b0c8a1ed82e6177809eb1af3a84d))

### [0.14.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.1...v0.14.2) (2021-07-24)


### Features

* remove message field from stake unstake & clean up Transaction input handling ([#220](https://www.github.com/radixdlt/olympia-wallet/issues/220)) ([c27be94](https://www.github.com/radixdlt/olympia-wallet/commit/c27be946863fee11a1c8719897b00462c3b5f8ef))

### [0.14.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.14.0...v0.14.1) (2021-07-23)


### Dependencies

* update icons ([#218](https://www.github.com/radixdlt/olympia-wallet/issues/218)) ([c96c86e](https://www.github.com/radixdlt/olympia-wallet/commit/c96c86ec9c1c1e5f816c9025a91253dd13b00776))

## [0.14.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.13.2...v0.14.0) (2021-07-23)


### Features

* New PIN entry ([#216](https://www.github.com/radixdlt/olympia-wallet/issues/216)) ([8dcc773](https://www.github.com/radixdlt/olympia-wallet/commit/8dcc7732f2cffa88a77c539f4e3ad72c3f1f74f5))


### Bug Fixes

* Addresses without XRD should be able to send transactions ([#214](https://www.github.com/radixdlt/olympia-wallet/issues/214)) ([2e5e11a](https://www.github.com/radixdlt/olympia-wallet/commit/2e5e11ad1a54a880ef92cad638d940f1b8a7a9cb))
* Stake List was using an unpredicatable key ([#215](https://www.github.com/radixdlt/olympia-wallet/issues/215)) ([273c1b9](https://www.github.com/radixdlt/olympia-wallet/commit/273c1b96657f5afd862d1a9c65de73594bc83043))
* Stake reducers need an initial value for empty lists ([#211](https://www.github.com/radixdlt/olympia-wallet/issues/211)) ([230a18e](https://www.github.com/radixdlt/olympia-wallet/commit/230a18eddfe6742838daab782ca881f247d35d10))


### Dependencies

* Various design enhancements ([#212](https://www.github.com/radixdlt/olympia-wallet/issues/212)) ([77be0a9](https://www.github.com/radixdlt/olympia-wallet/commit/77be0a9b3a041e7ad6d62f1b7bf82f79c260db0c))

### [0.13.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.13.1...v0.13.2) (2021-07-22)


### Dependencies

* update JS libs to 2.1.14 ([#209](https://www.github.com/radixdlt/olympia-wallet/issues/209)) ([715e695](https://www.github.com/radixdlt/olympia-wallet/commit/715e6955f27f08e73479899da9af66693896fae4))

### [0.13.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.13.0...v0.13.1) (2021-07-22)


### Bug Fixes

* round half up, not truncate ([#206](https://www.github.com/radixdlt/olympia-wallet/issues/206)) ([58ceefc](https://www.github.com/radixdlt/olympia-wallet/commit/58ceefca5af406c89c7e1fd98ebc2ea6b35cbcf7))


### Dependencies

* update help url ([#208](https://www.github.com/radixdlt/olympia-wallet/issues/208)) ([6250b26](https://www.github.com/radixdlt/olympia-wallet/commit/6250b26f240048a32593b2462bf021fe7c1f3710))

## [0.13.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.12.4...v0.13.0) (2021-07-22)


### Features

* A user can reset their wallet ([#203](https://www.github.com/radixdlt/olympia-wallet/issues/203)) ([0db13c3](https://www.github.com/radixdlt/olympia-wallet/commit/0db13c3625ca9f9ed38f5fbe549b51b63cf1c0ce))


### Bug Fixes

* Account Renaming broken from Ledger Epic ([#200](https://www.github.com/radixdlt/olympia-wallet/issues/200)) ([8b93452](https://www.github.com/radixdlt/olympia-wallet/commit/8b9345292e6adc79d2bbc915a16b597abc311444))
* add proper verify address modals everywhere ([#197](https://www.github.com/radixdlt/olympia-wallet/issues/197)) ([7eea9d1](https://www.github.com/radixdlt/olympia-wallet/commit/7eea9d11f456bc2f928fd51d9cbf6d275ce9616b))
* Current Stake Logic and UX ([#202](https://www.github.com/radixdlt/olympia-wallet/issues/202)) ([dc5c10a](https://www.github.com/radixdlt/olympia-wallet/commit/dc5c10a07faea020756297b30c37cc74569b458a))

### [0.12.4](https://www.github.com/radixdlt/olympia-wallet/compare/v0.12.3...v0.12.4) (2021-07-20)


### Bug Fixes

* Validator SDK updates ([#198](https://www.github.com/radixdlt/olympia-wallet/issues/198)) ([4cd4afa](https://www.github.com/radixdlt/olympia-wallet/commit/4cd4afa3c8b91bb02a5e91967df1a93aa676063c))

### [0.12.3](https://www.github.com/radixdlt/olympia-wallet/compare/v0.12.2...v0.12.3) (2021-07-20)


### Bug Fixes

* Add the settings link back ([#195](https://www.github.com/radixdlt/olympia-wallet/issues/195)) ([0132e70](https://www.github.com/radixdlt/olympia-wallet/commit/0132e708168249a798bfb8222d753eff64a40500))

### [0.12.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.12.1...v0.12.2) (2021-07-20)


### Bug Fixes

* include more entitlements for the mac builds ([#193](https://www.github.com/radixdlt/olympia-wallet/issues/193)) ([967a953](https://www.github.com/radixdlt/olympia-wallet/commit/967a953dbf991001fbc8092897748dd823248137))

### [0.12.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.12.0...v0.12.1) (2021-07-20)


### Features

* Ledger  ([#147](https://www.github.com/radixdlt/olympia-wallet/issues/147)) ([9d0f904](https://www.github.com/radixdlt/olympia-wallet/commit/9d0f904a2ee8cc42432c6c3741514ce07685337a))


### Dependencies

* **deps:** bump browserslist from 4.16.3 to 4.16.6 ([#91](https://www.github.com/radixdlt/olympia-wallet/issues/91)) ([0b277e1](https://www.github.com/radixdlt/olympia-wallet/commit/0b277e1afbd1d8cca4eec97e7017cc148475bf80))
* **deps:** bump dns-packet from 1.3.1 to 1.3.4 ([#93](https://www.github.com/radixdlt/olympia-wallet/issues/93)) ([571a5bf](https://www.github.com/radixdlt/olympia-wallet/commit/571a5bf3b94e1ec748c8b5f5bbe48490df3b124c))
* **deps:** bump postcss from 7.0.35 to 7.0.36 ([#118](https://www.github.com/radixdlt/olympia-wallet/issues/118)) ([36ba62d](https://www.github.com/radixdlt/olympia-wallet/commit/36ba62d3e0b2e571e22aa04c158bb63e5b3f558a))
* **deps:** bump ws from 6.2.1 to 6.2.2 ([#100](https://www.github.com/radixdlt/olympia-wallet/issues/100)) ([0e37801](https://www.github.com/radixdlt/olympia-wallet/commit/0e3780190738fb8d2bc21c5c8e3845ee950281d0))

## [0.12.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.11.2...v0.12.0) (2021-07-20)


### Features

* Too many PIN attempts should lock the wallet ([2678ae4](https://www.github.com/radixdlt/olympia-wallet/commit/2678ae44c2f008c853910cd5fb4c56abef3e0205))


### Bug Fixes

* Menus should include reload and force reload ([69acf12](https://www.github.com/radixdlt/olympia-wallet/commit/69acf12787db8823e2ee3193462f0927e34a55c6))
* use high level method for unstakes ([#182](https://www.github.com/radixdlt/olympia-wallet/issues/182)) ([6b7671e](https://www.github.com/radixdlt/olympia-wallet/commit/6b7671e4c5aac269c14a2333693fefaf0a88eef7))
* Validator, Account, and Transaction IDs should have specific shortened formats ([d1fcb9c](https://www.github.com/radixdlt/olympia-wallet/commit/d1fcb9c3da8502a82b4de7896f1f09aefdc6d976))


### Dependencies

* Use the latest SDK ([#189](https://www.github.com/radixdlt/olympia-wallet/issues/189)) ([12aade2](https://www.github.com/radixdlt/olympia-wallet/commit/12aade21a801205ed91f62c28056cd379fe53181))

### [0.11.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.11.1...v0.11.2) (2021-07-15)


### Bug Fixes

* Update Faucet Request ([5a43bae](https://www.github.com/radixdlt/olympia-wallet/commit/5a43baeca958d0ab31776995a1ce86e775b446eb))

### [0.11.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.11.0...v0.11.1) (2021-07-15)


### Bug Fixes

* Add more menu items so we can copy and paste in the app ([#178](https://www.github.com/radixdlt/olympia-wallet/issues/178)) ([14f130b](https://www.github.com/radixdlt/olympia-wallet/commit/14f130b85fd783af3470d8d41983f60cf672b159))
* Correctly type a pending transaction so it displays in history correctly ([fe83bdd](https://www.github.com/radixdlt/olympia-wallet/commit/fe83bddddaab64e2433a4c6de014cd13f6550a39))


### Dependencies

* remove fee from send tokens and stake forms ([709345d](https://www.github.com/radixdlt/olympia-wallet/commit/709345d5c4c91f3fca35247d7dfff6509ae26df7))
* update min stake copy to 100 XRD ([dc9718a](https://www.github.com/radixdlt/olympia-wallet/commit/dc9718ab21586517e94ffa285a47fa3a27e75d0f))

## [0.11.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.10.2...v0.11.0) (2021-07-15)


### Features

* App Updates should be opt in ([#175](https://www.github.com/radixdlt/olympia-wallet/issues/175)) ([36fea8a](https://www.github.com/radixdlt/olympia-wallet/commit/36fea8a300400e4be32b8c262234b0283346651d))


### Dependencies

* **copy:** Update the copy for the staking and unstaking forms ([#169](https://www.github.com/radixdlt/olympia-wallet/issues/169)) ([d448fae](https://www.github.com/radixdlt/olympia-wallet/commit/d448fae67810d8f5a0a73db3ea3b32329aed0d27))

### [0.10.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.10.1...v0.10.2) (2021-07-14)


### Bug Fixes

* Toast Updates ([#171](https://www.github.com/radixdlt/olympia-wallet/issues/171)) ([7c6d0ff](https://www.github.com/radixdlt/olympia-wallet/commit/7c6d0ff5401c7f8781a28341522605f88fcaf49a))

### [0.10.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.10.0...v0.10.1) (2021-07-14)


### Bug Fixes

* Enable auto updates ([85092db](https://www.github.com/radixdlt/olympia-wallet/commit/85092db9f98836a16b2978677d5d4fc83896ff29))

## [0.10.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.5...v0.10.0) (2021-07-13)


### Features

* copying addresses in wallet and explorer ([#165](https://www.github.com/radixdlt/olympia-wallet/issues/165)) ([2c4a6db](https://www.github.com/radixdlt/olympia-wallet/commit/2c4a6db15e451404650cd744eb2aa9b866bebedd))


### Dependencies

* upgrade JS lib to fix staking on stokenet ([#166](https://www.github.com/radixdlt/olympia-wallet/issues/166)) ([7957964](https://www.github.com/radixdlt/olympia-wallet/commit/7957964a34ecb10cfd93138f4fbd8aa355206055))

### [0.9.5](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.4...v0.9.5) (2021-07-13)


### Dependencies

* move to stokenet ([f1466c3](https://www.github.com/radixdlt/olympia-wallet/commit/f1466c3ff16af7e99b483a561b1cfaf8f666d041))

### [0.9.4](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.3...v0.9.4) (2021-07-12)


### Bug Fixes

* action-electron-builder needs mac_certs_password ([#162](https://www.github.com/radixdlt/olympia-wallet/issues/162)) ([f5e14cc](https://www.github.com/radixdlt/olympia-wallet/commit/f5e14ccd9a8aeb20ce0aa049af5249db4a777e00))

### [0.9.3](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.2...v0.9.3) (2021-07-12)


### Bug Fixes

* Cert Password Variable in Workflow ([8bd0fab](https://www.github.com/radixdlt/olympia-wallet/commit/8bd0fabced3b6028f9cdc55a6979374ce06e98ea))

### [0.9.2](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.1...v0.9.2) (2021-07-12)


### Bug Fixes

* s/ouputs/outputs/ in the workflow file ([#159](https://www.github.com/radixdlt/olympia-wallet/issues/159)) ([985becc](https://www.github.com/radixdlt/olympia-wallet/commit/985becc5a5ba11ea3f535d233ecd58fa4f0ffb79))

### [0.9.1](https://www.github.com/radixdlt/olympia-wallet/compare/v0.9.0...v0.9.1) (2021-07-12)


### Bug Fixes

* Release Please Output ([#157](https://www.github.com/radixdlt/olympia-wallet/issues/157)) ([ed61b26](https://www.github.com/radixdlt/olympia-wallet/commit/ed61b262acf3d25752f8d96b1184620158a13ca4))

## [0.9.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.8.0...v0.9.0) (2021-07-12)


### Features

* Encrypted Messages should be manually decrypted ([#148](https://www.github.com/radixdlt/olympia-wallet/issues/148)) ([76191c5](https://www.github.com/radixdlt/olympia-wallet/commit/76191c519b210ffc3ee38e6de98b857d30b02144))
* Monospaced addresses ([#151](https://www.github.com/radixdlt/olympia-wallet/issues/151)) ([530e8ce](https://www.github.com/radixdlt/olympia-wallet/commit/530e8cec6e26a357f7369b42baf25eabfb80563a))
* Notarize mac builds ([#153](https://www.github.com/radixdlt/olympia-wallet/issues/153)) ([f868dd8](https://www.github.com/radixdlt/olympia-wallet/commit/f868dd87c0d6a25796e922e72ebc845434f2197c))
* update decimal display ([#126](https://www.github.com/radixdlt/olympia-wallet/issues/126)) ([dc496b3](https://www.github.com/radixdlt/olympia-wallet/commit/dc496b3c7c6d2dc3dd73cc0d4b5ff59c1380df22))


### Bug Fixes

* Bring back number inputs, extend fee calculation throttle ([#138](https://www.github.com/radixdlt/olympia-wallet/issues/138)) ([525f230](https://www.github.com/radixdlt/olympia-wallet/commit/525f230d6eed656b1501b8f030df6bf1c1ade5d7))
* **CI:** Unnecessary release builds ([#143](https://www.github.com/radixdlt/olympia-wallet/issues/143)) ([f565372](https://www.github.com/radixdlt/olympia-wallet/commit/f5653723cf14cb5625f22fb1965b9fa0a291b58d))
* Mac OS Builds should be signed ([1dd9ea7](https://www.github.com/radixdlt/olympia-wallet/commit/1dd9ea7d663d192a3d01002e6ff30c49f1879045))
* Replace overflow-_-scroll with overflow-_-auto ([#152](https://www.github.com/radixdlt/olympia-wallet/issues/152)) ([38ae47b](https://www.github.com/radixdlt/olympia-wallet/commit/38ae47bafcc56dc9e2ef870c731ceaac2701051b))
* TailwindCSS Config Broken in a rebase ([#142](https://www.github.com/radixdlt/olympia-wallet/issues/142)) ([a5f2f96](https://www.github.com/radixdlt/olympia-wallet/commit/a5f2f96337e2bc776a2f3adc5ba32ee89c62b40b))
* Transaction Wallet Step ([e52e0c8](https://www.github.com/radixdlt/olympia-wallet/commit/e52e0c83179d591c976019036c2c1ab8efa897f8))
* Transactions should only display actions relevant to the active address ([#134](https://www.github.com/radixdlt/olympia-wallet/issues/134)) ([70971bc](https://www.github.com/radixdlt/olympia-wallet/commit/70971bc616a54d42c40cabc5965340698f2591d4))


### Dependencies

* Improve support for min screen size in onboarding ([#155](https://www.github.com/radixdlt/olympia-wallet/issues/155)) ([edb9aa3](https://www.github.com/radixdlt/olympia-wallet/commit/edb9aa3324f4205247009d9621b34bf0931bc91b))
* Release builds should speak to sandpit ([#156](https://www.github.com/radixdlt/olympia-wallet/issues/156)) ([f41f45f](https://www.github.com/radixdlt/olympia-wallet/commit/f41f45f5f6e6944010a0c15c71a924ebf311d54c))
* remove betanet warnings ([#154](https://www.github.com/radixdlt/olympia-wallet/issues/154)) ([cf46405](https://www.github.com/radixdlt/olympia-wallet/commit/cf46405c644d708afd04350875006742b0a6835a))
* Update labels on the confirmation modal to be relevant to the action taken ([#135](https://www.github.com/radixdlt/olympia-wallet/issues/135)) ([2e7e882](https://www.github.com/radixdlt/olympia-wallet/commit/2e7e882398fb723a9ec157b63bf00deba782d7ea))

## [0.8.0](https://www.github.com/radixdlt/olympia-wallet/compare/v0.7.6...v0.8.0) (2021-06-24)


### Features

* Transactions can be pagianted. ([#123](https://www.github.com/radixdlt/olympia-wallet/issues/123)) ([85410f9](https://www.github.com/radixdlt/olympia-wallet/commit/85410f9d5b5c1816e01107da8f957027a13c717a))
* Transfers can have messages that can be encrypted ([#128](https://www.github.com/radixdlt/olympia-wallet/issues/128)) ([e3c82e5](https://www.github.com/radixdlt/olympia-wallet/commit/e3c82e5c1c26ee5254d52fed53ba86c4f7c3530d))


### Bug Fixes

* Replace number inputs with validated text fields ([#121](https://www.github.com/radixdlt/olympia-wallet/issues/121)) ([690a541](https://www.github.com/radixdlt/olympia-wallet/commit/690a541b66127a9f7480cf06b313b2f5c6b6c300))
* Staking Confrmation Modal does include a message ([#132](https://www.github.com/radixdlt/olympia-wallet/issues/132)) ([6cc1965](https://www.github.com/radixdlt/olympia-wallet/commit/6cc1965835f601c5845d18ec987fdb7300671e41))
* Unstakes should include stakes from all epochs ([#131](https://www.github.com/radixdlt/olympia-wallet/issues/131)) ([543a162](https://www.github.com/radixdlt/olympia-wallet/commit/543a162f881f7626db627677685e9d546a098d0d))


### Code Style

* Confirmation Modal should include a label for the PIN input ([#124](https://www.github.com/radixdlt/olympia-wallet/issues/124)) ([184037d](https://www.github.com/radixdlt/olympia-wallet/commit/184037d48c3a3f6b1e307d1642394326fe95ad04))
* encrypted messages should show a lock ([#130](https://www.github.com/radixdlt/olympia-wallet/issues/130)) ([b605ddc](https://www.github.com/radixdlt/olympia-wallet/commit/b605ddc87bc1717cf239afb116d7ab0ef70e3c8d))
* Remove the .envrc from git since it should be ignored and unique per local environment. ([#122](https://www.github.com/radixdlt/olympia-wallet/issues/122)) ([ee5f6ba](https://www.github.com/radixdlt/olympia-wallet/commit/ee5f6ba8a35b8b854d0b33e943bd9378972c8e10))

### [0.7.6](https://www.github.com/radixdlt/olympia-wallet/compare/v0.7.5...v0.7.6) (2021-06-16)


### Bug Fixes

* Form error messages should have a configurable label ([#119](https://www.github.com/radixdlt/olympia-wallet/issues/119)) ([11904cd](https://www.github.com/radixdlt/olympia-wallet/commit/11904cd50ede57eb617abb9c60611aae143937b9))

### [0.7.5](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.7.4...v0.7.5) (2021-06-15)


### Bug Fixes

* final staking tweaks ([#116](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/116)) ([7e912a9](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7e912a98082684591083e371da3a6ad4b93c4ccd))

### [0.7.4](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.7.3...v0.7.4) (2021-06-14)


### Bug Fixes

* Treat unstakes as a separate count of XRD that are mine but unavailable ([#114](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/114)) ([750d81f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/750d81fedf069c152f2bded17ba5cf4712cc444a))

### [0.7.3](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.7.2...v0.7.3) (2021-06-11)


### Bug Fixes

* Catch transaction errors that were silently failing ([fdacb0e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fdacb0e410d6a4959866e776a757496ce8ae1ba2))
* Cleanup StakeListItem UI on smaller screens ([fdacb0e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fdacb0e410d6a4959866e776a757496ce8ae1ba2))
* Correctly compute user’s total XRD as the addition between api’s totalXRD and api’s totalStaked ([fdacb0e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fdacb0e410d6a4959866e776a757496ce8ae1ba2))


### Dependencies

* Cleanup staking UI ([fdacb0e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fdacb0e410d6a4959866e776a757496ce8ae1ba2))
* rebuild release ([#111](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/111)) ([fdacb0e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fdacb0e410d6a4959866e776a757496ce8ae1ba2))
* Staking validation cleanup ([ca0296f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/ca0296f243e8069b46562836392793030b42c365))

### [0.7.2](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.7.1...v0.7.2) (2021-06-10)


### Dependencies

* rebuild release ([#109](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/109)) ([712ff0b](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/712ff0b4d7576fcb496ae912e269362f2f6a593f))

### [0.7.1](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.7.0...v0.7.1) (2021-06-09)


### Bug Fixes

* Release Cycle needs Environment Variables ([#106](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/106)) ([682f0ba](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/682f0bac5d175c23b3bf5a6b1c931e568098f1b5))

## [0.7.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.6.2...v0.7.0) (2021-06-09)


### Features

* Set urls as env variables ([#104](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/104)) ([67c6013](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/67c60137588b84643bed9dccf88f391bc5b5bc2a))

### [0.6.2](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.6.1...v0.6.2) (2021-06-07)


### Dependencies

* Update urls to releasenet for now ([#101](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/101)) ([3fa8c38](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/3fa8c38973e141d301c58efd2e9ee501dd5dc315))

### [0.6.1](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.6.0...v0.6.1) (2021-06-04)


### Dependencies

* minor staking cleanup ([#97](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/97)) ([0a2f193](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0a2f1933c5feda97f7b92c92976854f0ea13ba1b))

## [0.6.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.7...v0.6.0) (2021-06-03)


### Features

* Connect staking and unstaking to api ([#88](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/88)) ([b6ee5ac](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b6ee5acb4a0dea482b3cfd38ebf0aaca7871d65d))
* Much Cleanup ([#96](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/96)) ([db05a74](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/db05a74f4d812c774467fc3e88088624569b3f67))


### Bug Fixes

* update form errors to use existing space ([#95](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/95)) ([b4d0239](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b4d0239d88e746945b6bd01f68b4ce73bd82929a))


### Dependencies

* update lib and typescript ([#86](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/86)) ([3c6a8f3](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/3c6a8f3138da0866f0c840cc527e1683f1f9a4a5))

### [0.5.7](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.6...v0.5.7) (2021-05-14)


### Features

* A number of smallish updates addressing post launch feedback. ([#87](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/87)) ([c769ce3](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/c769ce33f4a78d691e1af1e1c0cad9dbd88a1b1f))


### Bug Fixes

* add cancel to pin modal, and fix input ([#49](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/49) / [#52](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/52)) ([#82](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/82)) ([b21709c](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b21709ca50a5bc4c404e8a9f3e652b0033c226ae))
* implement latest account/wallet changes ([#81](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/81)) ([46f45aa](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/46f45aa26966a3feb15a2004272f7793d97781ef))


### Dependencies

* Cleanup ref typing ([#85](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/85)) ([2399621](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2399621a1ed73bacc05736557470ce3488e96e96))

### [0.5.6](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.5...v0.5.6) (2021-05-04)


### Dependencies

* update copy capitalization ([#78](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/78)) ([2dea9b1](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2dea9b179cbb9019717b15e4f1ce78075fb77a1e))

### [0.5.5](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.4...v0.5.5) (2021-05-02)


### Dependencies

* import everything from @radixdlt/application ([#74](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/74)) ([0d48570](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0d48570924bfe6ea8195614871ff299a3805db8d))

### [0.5.4](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.3...v0.5.4) (2021-05-01)


### Bug Fixes

* don't show loading side by side ([#72](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/72)) ([7b2a473](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7b2a47359af853c5129035910a755c8133a60d6e))

### [0.5.3](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.2...v0.5.3) (2021-05-01)


### Bug Fixes

* correct loading indicator view states ([#70](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/70)) ([3ac7dd9](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/3ac7dd9c8017a79602a34666d61538489d08c806))

### [0.5.2](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.1...v0.5.2) (2021-04-30)


### Bug Fixes

* tweak loading timeout and size ([#68](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/68)) ([b5636dc](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b5636dc35fcddfdf8aea0769b05cd0ec19c596d5))

### [0.5.1](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.5.0...v0.5.1) (2021-04-30)


### Bug Fixes

* account list not getting last index ([#65](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/65)) ([c902a21](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/c902a21e87d189416d2859e2b13d26c51fc6d3da))
* subscriptions teardown ([#63](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/63)) ([6ccfea7](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6ccfea7664e16ed8518a35142331c07bf2ec74c4))


### Dependencies

* enhanced decimal formatting rules ([#67](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/67)) ([401504f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/401504f045a9ae00f91cd7188433589954a5c1a6))
* Post launch clean up ([#66](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/66)) ([8976074](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/897607417934a529b22d29c6cf69781bbf762a7b))

## [0.5.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.4.0...v0.5.0) (2021-04-28)


### Features

* Scroll to top when navigating between routes ([#57](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/57)) ([c0ae2ef](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/c0ae2ef2fe27e475ac80c0d1f4499018dd0bfbbc))


### Dependencies

* bump to v0.5.0 ([#62](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/62)) ([7b646cc](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7b646cc3d1107c241aac04302753bc3a4f1fa015))
* Final final final round of release tweaks ([#60](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/60)) ([d0534dc](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/d0534dcfa1ad33c0e39bfce5405fedbe10ff1d6f))

## [0.4.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.3.3...v0.4.0) (2021-04-28)


### Features

* Include the package version number in the title of the builds ([#52](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/52)) ([706861f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/706861f8b755888823b44be1eef53a326160357d))


### Bug Fixes

* Pin and confirmation must match when setting pin ([#56](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/56)) ([7dbdc68](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7dbdc68ccdd81ec745569d25718ee704ffa6eda6))

### [0.3.3](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.3.2...v0.3.3) (2021-04-28)


### Features

* Final round of pre-betanet fixes ([#50](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/50)) ([3fdcefe](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/3fdcefe1e893b35f1cfb11e4b4ca7eb9390769ab))

### [0.3.2](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.3.1...v0.3.2) (2021-04-27)


### Bug Fixes

* explicit configs for publishing releases ([4c8b987](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/4c8b9872363949a68559076afbce83b6b1a5988e))
* Force a more recent version of electron-builder ([f362b94](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/f362b9424e620952132d00edd6ec82807b6ce0b1))

### [0.3.1](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.3.0...v0.3.1) (2021-04-27)


### Bug Fixes

* delete version.txt ([#46](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/46)) ([e557902](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e55790294a274bd8de397408f3e2bcd3d11ec144))

## [0.3.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v0.2.0...v0.3.0) (2021-04-27)


### Features

* Send Token Refinements ([#41](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/41)) ([e227007](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e2270070a0c25f0b1f3c31e15013e0d0f3c80a04))
* update README ([4e35bf4](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/4e35bf4faa204aeef0a47129977796831694d346))


### Bug Fixes

* Cancel transaction subscriptions when the user cancels transaction ([#42](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/42)) ([2fd939d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2fd939d0f79eaf45a6240985eca65e9f8860698a))
* try to get all the versions to match ([#44](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/44)) ([5dcde25](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/5dcde25ed8eaa8a88d09b1db9bd6f20fefc66c80))


### Dependencies

* bump version and improve browser window ([259f414](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/259f41475ac2942261f9734ffa745d9b4789e60a))
* Update Release Please ([8e0b9e5](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8e0b9e5185ae0b57ae3cb01bea6b0852f88c153c))

## [0.3.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v1.1.0...v0.2.0) (2021-04-27)

### Nothing Here

## [0.2.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v1.1.0...v0.2.0) (2021-04-27)

### Features

* Add app name and version number to title bar ([a2ddfcf](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a2ddfcfbad422133c56e5612397ef4b1c3839bcc))
* add build details, app icons ([32dfa83](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/32dfa83655b2c8f2f93808427968d70ff7af8514))
* add current address to history ([6616748](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6616748930a776a97e70e565a937afdb981f98e8))
* allow restart of create or restore wallet ([0dc55b4](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0dc55b46b5b5b91a2480a8f41ba945517de231f8))
* clean up history view ([04a3870](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/04a38703fe6f711997549a4dfaddf00e09d9811b))
* increase polling + clear balance on acct switch ([a462d12](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a462d12d83ba075499d87fdaee54c2c5430cfb4d))
* list seed phrase with numbers ([fb7a1ac](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fb7a1aca484971218c408d59d7e6379ceeb22295))
* menu + wallet/account cleanup ([8c21424](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8c21424776f61199bd9374135594fb05a17ebb53))
* pin input should only accept numbers ([e2f5e75](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e2f5e75948d569022f291242184c7cb337e24142))
* prep browserwindow definition for prod use ([21e1727](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/21e1727abe0039d5941e22b430e06cee06aa082c))
* Show nice error for incorrect password ([a1d3d8d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a1d3d8decb3f9def2ec895ffdcc9b296358193c7))
* show the correct token in history ([e85cdc2](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e85cdc2fc2bd843ca70ca277613565f7714af3d3))
* Show validation error on transaction form when transaction fails to build on the network ([ffb3776](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/ffb37766776ea2e23312c479a4679d9360fb4236))
* you can select nothing ([a649ec0](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a649ec0501b07c77b251d69b81e17fc2732e2f99))


### Bug Fixes

* Cleanup how we present big amounts with new sdk typing ([9932e7d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9932e7d9025df20727f59d1412acce0266c555fd))
* Correctly display sentAt in transaction history ([bb1f265](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/bb1f265550637702c49c7edb039caac6e4fc2f72))
* Properly display total XRD tokens in balances overview ([7297af4](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7297af497c270a901901289852e8e6f6f65a63c4))
* Replace edit account icon ([8cefa53](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8cefa532be61f4ac4a3a2e01782a7f4b39294b4c))
* show word # in restore ([2058774](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2058774773aeafeb67ab1d135e9e5e82ceae8230))
* users should have to explicitly cancel TX ([bd12c5c](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/bd12c5cee4189df717e18b2ebea8a9cd60cb97fd))


### Dependencies

* bump version to 0.2.0 ([b88de80](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b88de800a48a00f61f165952a3197eb57b37c6c9))
* clean up overview, staking, transaction ([94a4c68](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/94a4c6840eac50c457555425006ae9c992d90044))
* copy updates ([58a9b85](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/58a9b850ee48c784c70ff76fa4e1ff5871e65104))
* fix home periods ([7c22201](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7c222018a4f364bdcdc98023cf88596959e7b914))
* more left sidebar cleanup ([0fc056f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0fc056f5dc94cd83e2112e886cf4f8af552c2ecc))
* post rebase clean up ([a9138eb](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a9138eb5dc6d44d3e5173a254a0713096f7a20f2))
* release 0.2.0 ([a76def5](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a76def5a1936a396f3cfaf36638aac6760f61ca8))
* release 0.2.0 ([42c3b92](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/42c3b92a6129b30fc25bf43bc064af16f40e6af1))
* remove pin length requirement ([a1e415f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a1e415f9606cf722b11e93c11ee451337c462b7a))
* remove white lines from background ([2caf25a](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2caf25aa528accc9a76cf20dd0891d8a298e9078))
* show -Fee for new TX ([b40b65d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b40b65d44e710e9e3feb2f645671f91b39582a97))
* Update SDK and make required AmountT changes ([8ea55c3](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8ea55c3c911b417441c5efda644f1c2006599498))
* update welcome copy ([9d0402e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9d0402e4c9e0d53aef5d490edad950afdbfd6f40))
* Upgrade to latest sdk and code cleanup ([33b5c3e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/33b5c3e078eadb862cbac19021f09aec4f405674))
* use formatAddressForDisplay ([6edbe3e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6edbe3e614052011e674a431e83a9793d157fb8f))

## [0.2.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v1.1.0...v0.2.0) (2021-04-27)


### Features

* Add app name and version number to title bar ([a2ddfcf](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a2ddfcfbad422133c56e5612397ef4b1c3839bcc))
* add build details, app icons ([32dfa83](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/32dfa83655b2c8f2f93808427968d70ff7af8514))
* add current address to history ([6616748](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6616748930a776a97e70e565a937afdb981f98e8))
* allow restart of create or restore wallet ([0dc55b4](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0dc55b46b5b5b91a2480a8f41ba945517de231f8))
* clean up history view ([04a3870](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/04a38703fe6f711997549a4dfaddf00e09d9811b))
* increase polling + clear balance on acct switch ([a462d12](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a462d12d83ba075499d87fdaee54c2c5430cfb4d))
* list seed phrase with numbers ([fb7a1ac](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fb7a1aca484971218c408d59d7e6379ceeb22295))
* menu + wallet/account cleanup ([8c21424](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8c21424776f61199bd9374135594fb05a17ebb53))
* pin input should only accept numbers ([e2f5e75](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e2f5e75948d569022f291242184c7cb337e24142))
* prep browserwindow definition for prod use ([21e1727](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/21e1727abe0039d5941e22b430e06cee06aa082c))
* Show nice error for incorrect password ([a1d3d8d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a1d3d8decb3f9def2ec895ffdcc9b296358193c7))
* show the correct token in history ([e85cdc2](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e85cdc2fc2bd843ca70ca277613565f7714af3d3))
* Show validation error on transaction form when transaction fails to build on the network ([ffb3776](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/ffb37766776ea2e23312c479a4679d9360fb4236))
* you can select nothing ([a649ec0](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a649ec0501b07c77b251d69b81e17fc2732e2f99))


### Bug Fixes

* Cleanup how we present big amounts with new sdk typing ([9932e7d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9932e7d9025df20727f59d1412acce0266c555fd))
* Correctly display sentAt in transaction history ([bb1f265](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/bb1f265550637702c49c7edb039caac6e4fc2f72))
* Replace edit account icon ([8cefa53](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8cefa532be61f4ac4a3a2e01782a7f4b39294b4c))
* show word # in restore ([2058774](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2058774773aeafeb67ab1d135e9e5e82ceae8230))
* users should have to explicitly cancel TX ([bd12c5c](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/bd12c5cee4189df717e18b2ebea8a9cd60cb97fd))


### Dependencies

* bump version to 0.2.0 ([b88de80](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b88de800a48a00f61f165952a3197eb57b37c6c9))
* clean up overview, staking, transaction ([94a4c68](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/94a4c6840eac50c457555425006ae9c992d90044))
* copy updates ([58a9b85](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/58a9b850ee48c784c70ff76fa4e1ff5871e65104))
* fix home periods ([7c22201](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7c222018a4f364bdcdc98023cf88596959e7b914))
* more left sidebar cleanup ([0fc056f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0fc056f5dc94cd83e2112e886cf4f8af552c2ecc))
* post rebase clean up ([a9138eb](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a9138eb5dc6d44d3e5173a254a0713096f7a20f2))
* release 0.2.0 ([42c3b92](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/42c3b92a6129b30fc25bf43bc064af16f40e6af1))
* remove pin length requirement ([a1e415f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a1e415f9606cf722b11e93c11ee451337c462b7a))
* remove white lines from background ([2caf25a](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/2caf25aa528accc9a76cf20dd0891d8a298e9078))
* show -Fee for new TX ([b40b65d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b40b65d44e710e9e3feb2f645671f91b39582a97))
* Update SDK and make required AmountT changes ([8ea55c3](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8ea55c3c911b417441c5efda644f1c2006599498))
* update welcome copy ([9d0402e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9d0402e4c9e0d53aef5d490edad950afdbfd6f40))
* Upgrade to latest sdk and code cleanup ([33b5c3e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/33b5c3e078eadb862cbac19021f09aec4f405674))
* use formatAddressForDisplay ([6edbe3e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6edbe3e614052011e674a431e83a9793d157fb8f))

## [1.1.0](https://www.github.com/township-agency/radixdlt-desktop-wallet/compare/v1.0.0...v1.1.0) (2021-04-26)


### Features

* a user can click to begin creating a wallet ([9256a89](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9256a893af574083649b7622c8b497046b18c4b1))
* Display and enter mnemonic when creating a wallet ([#4](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/4)) ([9af457f](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/9af457fc2974ef5f300a336d39772f626fe7cebd))
* display list of accounts on wallet view ([#12](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/12)) ([ca9b221](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/ca9b221d5d71382ace29035c33f118607dd0d75e))
* display pending transactions in history ([21631b0](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/21631b033e7cf0a4d8f59499c19828798cb00be1))
* ensure user can’t navigate away from modal once they’re submitted ([c424658](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/c4246589b202ba7c48e5ccab5af4b108816c7fdf))
* enter passcode to decrypt wallet when starting the app ([#11](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/11)) ([f00d12e](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/f00d12ed73c71c5a499ed142d7f67e504b31a0c7))
* securely store keystore and pin ([5459100](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/545910012e55afdd8d0a15268cbfca2912ab2b09))
* transfer tokens from account ([e6d53b5](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/e6d53b54f169927461a432f770ff8306502e96be))
* use i18n to pass all copy through internationalization before rendering ([#14](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/14)) ([489312c](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/489312c8dae81f3b86864c15c50fc8f1c3d09da8))
* validate pin input while confirming transaction ([#23](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/23)) ([0889369](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/0889369ffff61d0568aa3e79b035191f0951d206))


### Bug Fixes

* release-please action was failing with old version of node ([#15](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/15)) ([a719bf8](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/a719bf86f17f3acad324219ced521e371d254aa8))
* Remove package-lock.json so build-release job will use yarn ([#28](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/28)) ([8be2d30](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/8be2d30b075db249589f1c1aabf752c042f50785))


### Dependencies

* Automate changelog ([22534fd](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/22534fd5870ec4622ccf91e86f07db7ab16811a7))
* Automate electron releases ([badcddf](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/badcddf0aaf262790c279bc1309e2dc47ea0fb83))
* Build Vue app with electron ([6466ea1](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/6466ea17810dfff5cd0de3afcee98597f11d5d7e))
* Install tailwindcss ([0184550](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/018455078097a413600e57142737e117acc64565))
* Install vue router and upgrade to Vue3 syntax ([b62c2a2](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/b62c2a21f9b8393de66700fb8d52398946298c0f))
* install vuex and connect store to pass wallet around ([#10](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/10)) ([58dea7c](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/58dea7c45562ecc685e0daa27696b5dcc7fa4eab))
* Integrate with radix class and rxjs to fetch wallet accounts ([#8](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/8)) ([fbb1f3d](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/fbb1f3dfeea2c8c3e169ccd74804954a883186c9))
* rename master branch to main ([cd1c661](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/cd1c66113710579a36801e68a113f487e5934487))
* update readme. npm => yarn. ([#16](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/16)) ([7f5de51](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/7f5de514b3ba77d37ab6741e1a47b25748a2bb36))
* Use reusable submit button on all forms ([#27](https://www.github.com/township-agency/radixdlt-desktop-wallet/issues/27)) ([846a9a4](https://www.github.com/township-agency/radixdlt-desktop-wallet/commit/846a9a435cc2faf53aaf15592ee955fb1cf36f81))
