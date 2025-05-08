import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css' // 引入vant组件样式

const app = createApp(App)

app.use(createPinia())
app.use(Vant)
app.use(router)


app.mount('#app')
