import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAnswerStore = defineStore('answer', () => {
    // 状态
    const userAnswers = ref({}); // 存储用户答案，格式为 {questionId: answer}
    const answeredQuestions = ref([]); // 已答题目的ID列表
    const correctAnswers = ref({}); // 存储正确答案，格式为 {questionId: correctAnswer}
    const isAnswerCorrect = ref({}); // 存储答题是否正确，格式为 {questionId: boolean}

    // 保存用户答案
    const saveUserAnswer = (questionId, answer) => {
        userAnswers.value[questionId] = answer;
        if (!answeredQuestions.value.includes(questionId)) {
            answeredQuestions.value.push(questionId);
        }
        // 判断答案是否正确
        checkAnswer(questionId);
    };
    
    // 保存正确答案
    const saveCorrectAnswer = (questionId, correctAnswer) => {
        correctAnswers.value[questionId] = correctAnswer;
    };
    
    // 检查答案是否正确
    const checkAnswer = (questionId) => {
        const userAnswer = userAnswers.value[questionId];
        const correctAnswer = correctAnswers.value[questionId];
        
        if (userAnswer === undefined || correctAnswer === undefined) {
            return;
        }
        
        // 对于不同类型的题目，判断方式可能不同
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            // 多选题：比较两个数组是否包含相同元素（不考虑顺序）
            const userAnswerSorted = [...userAnswer].sort();
            const correctAnswerSorted = [...correctAnswer].sort();
            isAnswerCorrect.value[questionId] = JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted);
        } else {
            // 单选题、判断题、填空题、简答题：直接比较
            isAnswerCorrect.value[questionId] = userAnswer === correctAnswer;
        }
    };
    
    // 获取用户答案
    const getUserAnswer = (questionId) => {
        return userAnswers.value[questionId];
    };
    
    // 获取答题是否正确
    const getIsAnswerCorrect = (questionId) => {
        return isAnswerCorrect.value[questionId];
    };
    
    // 清空所有答案
    const clearAllAnswers = () => {
        userAnswers.value = {};
        answeredQuestions.value = [];
        correctAnswers.value = {};
        isAnswerCorrect.value = {};
    };
    
    // 计算答题正确率
    const calculateAccuracy = () => {
        if (answeredQuestions.value.length === 0) return 0;
        
        let correctCount = 0;
        answeredQuestions.value.forEach(questionId => {
            if (isAnswerCorrect.value[questionId]) {
                correctCount++;
            }
        });
        
        return (correctCount / answeredQuestions.value.length) * 100;
    };

    return {
        userAnswers,
        answeredQuestions,
        correctAnswers,
        isAnswerCorrect,
        saveUserAnswer,
        saveCorrectAnswer,
        checkAnswer,
        getUserAnswer,
        getIsAnswerCorrect,
        clearAllAnswers,
        calculateAccuracy
    };
},
//持久化
{
    //持久化的配置同时支持小程序和网页端
    persist: {
        storage: {
            getItem(key) {
                return typeof window !== 'undefined'
                    ? localStorage.getItem(key)
                    : uni.getStorageSync(key);
            },
            setItem(key, value) {
                return typeof window !== 'undefined'
                    ? localStorage.setItem(key, value)
                    : uni.setStorageSync(key, value);
            },
        }
    }
});