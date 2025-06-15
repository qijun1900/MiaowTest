import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import escconfig from './src/config/esc.config';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { AntDesignXVueResolver } from 'ant-design-x-vue/resolver'
import { TDesignResolver } from 'unplugin-vue-components/resolvers';
import pxtorem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [AntDesignXVueResolver()],
    }),
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'mobile-vue'
      })],
    }),
    Components({
      resolvers: [TDesignResolver({
        library:'mobile-vue'
      })],
    })
  ],
  css: {
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 16,
          propList: ['*'],
          selectorBlackList: ['html', 'van-'],
          minPixelValue: 2
        }),
        autoprefixer()
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/webapi': {
        target: `http://${escconfig.serverHost}:${escconfig.serverPort}`,
        changeOrigin: true,
      }
    }
  },
})
