const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule('xlsx')
      .test(/\.xlsx$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[ext]', // Use the original file name and extension
        outputPath: 'assets/', // Save the processed file in the `assets/` directory
      })
      .end();
  },
});
