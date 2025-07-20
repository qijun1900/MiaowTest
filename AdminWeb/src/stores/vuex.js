import { createStore } from 'vuex'
export default createStore({
  state: {
  isGetterRouter:false,
  },
  mutations: {
    ChangesGetterRouter(state,value){
      state.isGetterRouter =value
    },
  },
})