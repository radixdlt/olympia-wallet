const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      externals: ['usb', 'node-hid', 'bindings'],
      nodeIntegration: true,
      chainWebpackRendererProcess: config => {
        config.target('web'),
        config.externals([{
          'electron-config': 'electron-config'
        }])
      },
      chainWebpackMainProcess: config => {
        config.optimization.minimizer(0).use(TerserPlugin, [{
          cache: true,
          parallel: true,
          terserOptions: {
              compress: {
                  reduce_vars: false
              }
          }
        }])
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
