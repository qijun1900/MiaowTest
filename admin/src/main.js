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
