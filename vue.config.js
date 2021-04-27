module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: {
          provider: 'github',
          private: true,
          releaseType: 'release'
        },
        snap: {
          publish: 'github'
        },
        appId: "com.radixdlt.olympia-wallet",
        productName: "Radix Wallet"
      },
      preload: 'src/preload.ts'
    }
  }
}
