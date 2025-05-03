import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import store from './store'
import '@/util/axios.config.js'

createApp(App)
.use(ElementPlus)
.use(store)
.use(router)
.mount('#app')

// 添加这段代码忽略ResizeObserver警告
const debounce = (fn, delay) => {
  let timer
  return function() {
    if(timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, arguments), delay)
  }
}

const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16)
    super(callback)
  }
}