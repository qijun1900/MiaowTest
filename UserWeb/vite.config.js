import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import escconfig from './src/config/esc.config'; // 修正导入方式

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {  // 添加服务器配置
    proxy: {
      '/webapi': {
        target: `http://${escconfig.serverHost}:${escconfig.serverPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webapi/, '') // 可选路径重写
      }
    }
  }
})
