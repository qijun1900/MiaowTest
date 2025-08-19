import {createPinia} from 'pinia'
import persist from 'pinia-plugin-persistedstate'

// 创建pinia实例
const pinia = createPinia()

// 注册pinia持久化插件
pinia.use(persist)

// 默认导出pinia实例给main.js使用
export default pinia

