const { defineConfig } = require('@vue/cli-service')
const { escconfig } = require('./src/config/esc.config');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/webapi': {
        target:`http://${escconfig.serverHost}:${escconfig.serverPort}`,
        changeOrigin: true,
      },
    },
  },  
})
