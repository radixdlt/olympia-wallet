module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
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
