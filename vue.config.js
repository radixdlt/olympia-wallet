const CopyWebpackPlugin = require('copy-webpack-plugin')
const NormalModuleReplacementPlugin = require('webpack').NormalModuleReplacementPlugin

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,

      chainWebpackRendererProcess: config => {
        config.target('web')
      },
      chainWebpackMainProcess: config => {
        config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
          {
            patterns: [
              'node_modules/@aleworm/usb/build/Release/usb_bindings.node',
              'node_modules/@aleworm/node-hid/build/Release/HID_hidraw.node'
            ]
          }
        ])

        config
          .plugin('NormalModuleReplacementPlugin')
          .use(NormalModuleReplacementPlugin, [
            /^bindings$/,
            `${__dirname}/src/bindings`
          ])
      },

      builderOptions: {
        asar: false,
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
