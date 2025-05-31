import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAnswerStore = defineStore('answer', () => {
    // 定义一个响应式的对象来存储答案状态
    const answerStates = ref(JSON.parse(localStorage.getItem('answerStates')) || {})
    // 保存答案状态的方法    
    function saveAnswerState(state) {
        const currentState = answerStates.value[state.questionId] || {};
        
        if (state.isJudgeTF) {
            // 如果是判断题操作，保留原有的用户答案数据
            answerStates.value[state.questionId] = {
                ...currentState,  // 保留原有状态
                answer: state.answer,
                selectedOption: state.selectedOption,
                selectedOptions: state.selectedOptions,
                isCorrect: state.isCorrect
            }
        } else {
            // 正常更新所有状态
            answerStates.value[state.questionId] = {
             ...currentState,  // 保留原有状态
            answer: state.answer,//判断是否已答题
            selectedOption: state.selectedOption,// 单选题判断题支持
            selectedOptions: state.selectedOptions,// 多选题支持
            userAnswers: state.userAnswers || [],// 填空题支持
            userAnswer: state.userAnswer || '', // 添加简答题支持
            isCorrect: state.isCorrect // 新增：是否正确，布尔值
            }
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

    // 新增方法：获取所有答题状态
    function getAllAnswerStates() {
        return answerStates.value
    }

    // 修改返回对象，添加新方法
    return { answerStates, saveAnswerState, getAnswerState, clearAnswers, getAllAnswerStates }// 返回需要的状态和方法
})
