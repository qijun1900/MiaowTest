import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * 答题状态管理Store
 * 用于管理用户答题过程中的所有状态，包括用户答案、正确答案、答题情况等
 * 支持多种题型的答案存储和校验，包括单选题、多选题、判断题
 */
export const useObjectiveAnswerStore = defineStore('objectiveAnswer', () => {
    // ================ 状态定义 ================
    /**
     * 用户答案存储
     * 格式: {questionId: answer}
     * questionId: 题目ID
     * answer: 用户答案（单选/判断为字符串，多选为数组）
     */
    const userAnswers = ref({}); 
    
    /**
     * 已答题目的ID列表
     * 用于记录用户已经回答过的题目，避免重复统计
     */
    const answeredQuestions = ref([]); 
    
    /**
     * 正确答案存储
     * 格式: {questionId: correctAnswer}
     * questionId: 题目ID
     * correctAnswer: 正确答案（单选/判断为字符串，多选为数组）
     */
    const correctAnswers = ref({}); 
    
    /**
     * 答题是否正确的状态
     * 格式: {questionId: boolean}
     * questionId: 题目ID
     * boolean: true表示答案正确，false表示答案错误
     */
    const isAnswerCorrect = ref({}); 

    // ================ 方法定义 ================
    
    /**
     * 保存用户答案
     * @param {string|number} questionId - 题目ID
     * @param {string|Array} answer - 用户答案
     * 流程:
     * 1. 将用户答案存储到userAnswers中
     * 2. 如果该题目尚未记录在已答列表中，则添加到answeredQuestions
     * 3. 调用checkAnswer方法检查答案是否正确
     */
    const saveUserAnswer = (questionId, answer) => {
        userAnswers.value[questionId] = answer;
        if (!answeredQuestions.value.includes(questionId)) {
            answeredQuestions.value.push(questionId);
        }
        // 判断答案是否正确
        checkAnswer(questionId);
    };
    
    /**
     * 保存正确答案
     * @param {string|number} questionId - 题目ID
     * @param {string|Array} correctAnswer - 正确答案
     * 通常在考试开始时或题目加载时调用，用于后续的答案校验
     */
    const saveCorrectAnswer = (questionId, correctAnswer) => {
        correctAnswers.value[questionId] = correctAnswer;
    };
    
    /**
     * 检查用户答案是否正确
     * @param {string|number} questionId - 题目ID
     * 处理逻辑:
     * 1. 获取用户答案和正确答案
     * 2. 如果任一答案不存在，则直接返回
     * 3. 根据题目类型进行不同的比较:
     *    - 多选题: 比较两个数组是否包含相同元素（不考虑顺序）
     *    - 单选题: 直接比较值是否相等
     * 4. 将比较结果存储到isAnswerCorrect中
     */
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
            // 单选题和判断题：使用宽松相等比较，允许类型转换
            isAnswerCorrect.value[questionId] = userAnswer == correctAnswer;
        }
    };
    
    /**
     * 获取用户答案
     * @param {string|number} questionId - 题目ID
     * @returns {string|Array} 用户答案
     */
    const getUserAnswer = (questionId) => {
        return userAnswers.value[questionId];
    };
    
    /**
     * 获取答题是否正确
     * 如，在考试结束后展示用户的答题情况
     * @param {string|number} questionId - 题目ID
     * @returns {boolean} 答案是否正确
     */
    const getIsAnswerCorrect = (questionId) => {
        return isAnswerCorrect.value[questionId];
    };
    
    /**
     * 清空所有答案
     * 通常在考试结束或重新开始考试时调用
     * 重置所有状态到初始值
     */
    const clearAllAnswers = () => {
        userAnswers.value = {};
        answeredQuestions.value = [];
        correctAnswers.value = {};
        isAnswerCorrect.value = {};
    };
    
    /**
     * 计算答题正确率
     * @returns {number} 正确率（0-100之间的数值）
     * 计算方法: 正确答题数 / 已答题总数 * 100
     * 如果没有答题，返回0
     */
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

    // ================ 导出的状态和方法 ================
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
// ================ 持久化配置 ================
/**
 * 持久化配置
 * 使Store的状态能够在页面刷新后保持
 * 同时支持小程序和网页端的存储方式
 */
{
    //持久化的配置同时支持小程序和网页端
    persist: {
        storage: {
            /**
             * 获取存储的数据
             * @param {string} key - 存储的键名
             * @returns {any} 存储的数据
             * 根据运行环境选择不同的存储API:
             * - 网页端: 使用localStorage
             * - 小程序端: 使用uni.getStorageSync
             */
            getItem(key) {
                return typeof window !== 'undefined'
                    ? localStorage.getItem(key)
                    : uni.getStorageSync(key);
            },
            /**
             * 设置存储的数据
             * @param {string} key - 存储的键名
             * @param {any} value - 要存储的数据
             * 根据运行环境选择不同的存储API:
             * - 网页端: 使用localStorage
             * - 小程序端: 使用uni.setStorageSync
             */
            setItem(key, value) {
                return typeof window !== 'undefined'
                    ? localStorage.setItem(key, value)
                    : uni.setStorageSync(key, value);
            },
        }
    }
});