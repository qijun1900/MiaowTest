import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    // 状态定义
    const isCollapse = ref(false);
    const userInfo = ref({});
    
    //action    
    const actions = {
        changeCollapse() {
            isCollapse.value = !isCollapse.value;
        },
        changeUserInfo(value) {
            // 使用 Object.assign 确保响应式更新
            userInfo.value = Object.assign({}, userInfo.value, value);
        },
        clearUserInfo() {
            userInfo.value = {};
        }
    };

    return { 
        isCollapse,
        userInfo,
        ...actions 
    };
}, {
    persist: {
        persist: true,
        paths: ['isCollapse', 'userInfo',],
    }
});
