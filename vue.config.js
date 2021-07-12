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
        appId: 'com.radixdlt.olympia-wallet',
        productName: 'Radix Wallet',
        mac: {
          hardenedRuntime: true,
          gatekeeperAssess: false
        },
        dmg: {
          sign: false
        },
        afterSign: 'scripts/notarize.js'
      },
      preload: 'src/preload.ts'
    }
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        const package = require('./package.json')
        args[0].title = `${package.description} (v${package.version})`
        return args
      })
  }
}
