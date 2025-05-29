import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAnswerStore = defineStore('answer', () => {
    const answerStates = ref(JSON.parse(localStorage.getItem('answerStates')) || {})
    
    function saveAnswerState(state) {
        answerStates.value[state.questionId] = {
            answer: state.answer,
            selectedOption: state.selectedOption,
            selectedOptions: state.selectedOptions,
            userAnswers: state.userAnswers || [],
            userAnswer: state.userAnswer || ''  // 添加简答题支持
        }
    }

    function getAnswerState(questionId) {
        return answerStates.value[questionId]
    }

    function clearAnswers() {
        answerStates.value = {}
    }

    watch(answerStates, (newVal) => {
        localStorage.setItem('answerStates', JSON.stringify(newVal))
    }, { deep: true })

    return { answerStates, saveAnswerState, getAnswerState, clearAnswers }
})
