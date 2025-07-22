import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    // 状态定义
    const isCollapse = ref(false);
    const userInfo = ref({});
    const examInfo = ref({});
    
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
        },
        changeExamInfo(value) {
            // 使用 Object.assign 确保响应式更新
            examInfo.value = Object.assign({}, examInfo.value, value);
        },

    };

    return { 
        isCollapse,
        userInfo,
        examInfo,
        ...actions 
    };
}, {
    persist: {
        persist: true,
        paths: ['isCollapse', 'userInfo',],
    }
});
