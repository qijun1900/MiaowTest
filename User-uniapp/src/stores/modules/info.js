import { ref } from "vue"
import { defineStore } from 'pinia';

export const useUserInfo = defineStore('userinfo',()=>{
    //信息
    const userInfo = ref()

    //登录保存
    const setInfo = (val)=>{
        userInfo.value = val
    }

    //清除
    const clearInfo = ()=>{
        userInfo.value = undefined
    }
    return {
        userInfo,
        setInfo,
        clearInfo
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