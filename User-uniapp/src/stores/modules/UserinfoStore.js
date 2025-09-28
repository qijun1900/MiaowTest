import { ref, computed } from "vue"
import { defineStore } from 'pinia';

export const UserInfoStore = defineStore('userinfo',()=>{
    //信息
    const userInfo = ref([])

    //登录保存
    const setUserInfo = (val)=>{
        userInfo.value = val
    }

    //清除
    const clearUserInfo = ()=>{
        userInfo.value = undefined
    }

    // 登录状态检查函数
    const isLoggedIn = computed(() => {
        return !!userInfo.value && Object.keys(userInfo.value).length > 0;
    })

    return {
        userInfo,
        setUserInfo,
        clearUserInfo,
        isLoggedIn
    }
},
//持久化
    {
        //持久化的配置同时支持小程序和网页端
        persist:{
            storage:{
                getItem(key){
                    return typeof window !== 'undefined' 
                        ? localStorage.getItem(key) 
                        : uni.getStorageSync(key);
                },
                setItem(key,value){
                    return typeof window !== 'undefined' 
                    ? localStorage.setItem(key,value)
                    : uni.setStorageSync(key,value);
                },
            }
        }
    }
)