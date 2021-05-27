const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      chainWebpackRendererProcess: config => {
        config.target('web')
      },
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
        productName: 'Radix Wallet'
      },
      preload: 'src/preload.ts'
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      const package = require('./package.json')
      args[0].title = `${package.description} (v${package.version})`
      return args
    })
  }
}
