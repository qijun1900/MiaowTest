import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server:{
    port:5050,//启动端口
    open: true, // 启动时自动打开浏览器
  }
})
