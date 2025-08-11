import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import ElementPlusX from 'vue-element-plus-x'
import App from './App.vue'
import '@/util/axios.config.js'


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia) 
app.use(router)
app.use(ElementPlus)
app.use(ElementPlusX)

app.mount('#app')