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
              'node_modules/usb/build/Release/usb_bindings.node',
              {
                from: 'node_modules/node-hid/build/Release/HID.node',
                noErrorOnMissing: true
              },
              {
                from: 'node_modules/node-hid/build/Release/HID_hidraw.node',
                noErrorOnMissing: true
              }
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
          entitlements: 'build/entitlements.mac.plist',
          entitlementsInherit: 'build/entitlements.mac.plist',
          gatekeeperAssess: false,
          target: ['dmg']
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
    config.plugin('html').tap(args => {
      const package = require('./package.json')
      args[0].title = `${package.description} (v${package.version})`
      return args
    })
  }
}
