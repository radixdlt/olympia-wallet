module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        snap: {
          publish: 'github'
        }
      },
      preload: 'src/preload.ts'
    }
  }
}
