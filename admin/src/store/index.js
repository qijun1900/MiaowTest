import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate';

export default createStore({
  state: {
  isGetterRouter:false,
  isCollapse:false,
  userInfo:{},
  },
  getters: {
  },
  mutations: {
    ChangesGetterRouter(state,value){
      state.isGetterRouter =value
    },
    //侧边栏
    changeCollapse(state){
      state.isCollapse = !state.isCollapse
    },
    changeUserInfo(state,value){
      state.userInfo = {
        ...state.userInfo,
        ...value
      }
    },
    clearUserInfo(state,value){
      state.userInfo={}
    },


  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState({
    paths:["isCollapse","userInfo"]
  })]
})
