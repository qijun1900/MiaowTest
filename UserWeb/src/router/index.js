import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // 需要添加的样式文件
import Home from '../views/Home/Home.vue'
import ExamList from '@/views/Exam/ExamList.vue'
import SearchInfo from '@/components/ViewsComponents/SearchInfoViews.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/ExamList',
    name: 'exam',
    component: ExamList
  },
  {
    path: '/SearchInfo',
    name: 'search',
    component: SearchInfo
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

//进度条
router.beforeEach((to, from, next) => {
  NProgress.start();
  next()
})

router.afterEach(() => {
  NProgress.done();
  window.scrollTo(0, 0) // 建议添加页面回顶
})


export default router
