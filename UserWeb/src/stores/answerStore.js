import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAnswerStore = defineStore('answer', () => {
    // 定义一个响应式的对象来存储答案状态
    const answerStates = ref(JSON.parse(localStorage.getItem('answerStates')) || {})
    // 保存答案状态的方法    
    function saveAnswerState(state) {
        answerStates.value[state.questionId] = {
            answer: state.answer,//判断是否已答题
            selectedOption: state.selectedOption,// 单选题支持
            selectedOptions: state.selectedOptions,// 多选题支持
            userAnswers: state.userAnswers || [],// 填空题支持
            userAnswer: state.userAnswer || ''  // 添加简答题支持
        }
    }
    // 获取指定问题的答案状态（id查找）
    function getAnswerState(questionId) {
        return answerStates.value[questionId]
    }
    // 清除所有答案状态
    function clearAnswers() {
        answerStates.value = {}
    }
    // 监听 answerStates 的变化并保存到 localStorage
    watch(answerStates, (newVal) => {
        localStorage.setItem('answerStates', JSON.stringify(newVal))
    }, { deep: true })

    return { answerStates, saveAnswerState, getAnswerState, clearAnswers }// 返回需要的状态和方法
})
