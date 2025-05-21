import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // 需要添加的样式文件
import Home from '../views/Home/Home.vue'
import ExamList from '@/views/Exam/ExamList.vue'
import SearchInfo from '@/components/ViewsComponents/SearchInfoViews.vue'
import SearchDeatil from '@/components/ViewsComponents/SearchDeatil.vue'
import ExamReady from '@/components/ViewsComponents/ExamReady.vue'
import ExamSetting from '@/components/ViewsComponents/ExamSetting.vue'
import PractisePage from '@/components/ViewsComponents/PractisePage.vue'
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
  },
  {
    path: '/SearchDeatil',
    name:'searchDeatil',
    component: SearchDeatil
  },
  {
    path: '/ExamReady/:id',
    name:'examReady',
    component: ExamReady
  },
  {
    path: '/ExamSetting/:id',
    name:'examSetting',
    component: ExamSetting
  },
  {
    path: '/PractisePage/:id',
    name:'practisePage',
    component: PractisePage
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
