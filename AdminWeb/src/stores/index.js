import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    // 状态定义
    const isCollapse = ref(false);//是否折叠
    const userInfo = ref({});//用户信息
    const examInfo = ref({});//当前考试信息
    const currentQuestionTotal = ref(0);//当前题目总数
    
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
        changecurrentQuestionTotal(value) {
            currentQuestionTotal.value = value;
        }
    };

    return { 
        isCollapse,
        userInfo,
        examInfo,
        currentQuestionTotal,
        ...actions 
    };
}, {
    persist: {
        persist: true,
        paths: ['isCollapse', 'userInfo',],
    }
});
