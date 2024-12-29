const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://ctweb.lumacloud.net',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/WebAPI'
        }
      }
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule('xlsx')
      .test(/\.xlsx$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[ext]',
        outputPath: 'assets/',
      })
      .end();
  },
});
