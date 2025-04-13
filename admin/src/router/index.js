import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/login.vue'
import Mainbox from '../views/mainbox.vue'
import RoutesConfig from './config'
import store  from '../store/index'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login 
  },
  {
    path: '/mainbox',
    name: 'mainbox',
    component:Mainbox

  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.name==='login'){
    next()
  }else{
    //无授权，重定向
    if(!localStorage.getItem("token")){
      next({
        path:'/login',    
      })
    }else{
      if(!store.state.isGetterRouter){
        router.removeRoute('mainbox')
        configrouter()
        next({
          path:to.fullPath
        })
      }else{
        next()
      }
    }
  }

})

const configrouter = ()=>{
  if(!router.hasRoute('mainbox')){
    router.addRoute(
      {
        path: '/mainbox',
        name: 'mainbox',
        component:Mainbox
    
      }
    )
  }
  RoutesConfig.forEach(item=>{
    checkPermission(item) && router.addRoute('mainbox',item)
    })

  store.commit('ChangesGetterRouter',true) 

}

const checkPermission = (item)=>{
  if(item.requireAdmin){
    return store.state.userInfo.role === 1  
  } 
  return true

}



export default router
