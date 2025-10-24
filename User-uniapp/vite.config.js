import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      uni(),
      visualizer()
    ],
    define: {
      'process.env': process.env
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 取消sass废弃API的报警
          silenceDeprecations: ['legacy-js-api', 'color-functions', 'import'],
        },
      },
    },
    server: {
      port: 5050,//启动端口
      open: true, // 启动时自动打开浏览器
    }
  }
})
