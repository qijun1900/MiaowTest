import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * 主观题答题状态管理Store
 * 用于管理用户主观题答题过程中的所有状态，包括用户答案、参考答案、用户自评情况等
 * 支持填空题和简答题的答案存储和用户自评
 */
export const useSubjectiveAnswerStore = defineStore('subjectiveAnswer', () => {
    // ================ 状态定义 ================
    /**
     * 用户答案存储
     * 格式: {questionId: answer}
     * questionId: 题目ID
     * answer: 用户答案（填空题为数组，简答题为字符串）
     */
    const userAnswers = ref({}); 
    
    /**
     * 已答题目的ID列表
     * 用于记录用户已经回答过的题目，避免重复统计
     */
    const answeredQuestions = ref([]); 
    
    /**
     * 参考答案存储
     * 格式: {questionId: referenceAnswer}
     * questionId: 题目ID
     * referenceAnswer: 参考答案（填空题为数组，简答题为字符串）
     */
    const referenceAnswers = ref({}); 
    
    /**
     * 用户自评是否正确的状态
     * 格式: {questionId: boolean}
     * questionId: 题目ID
     * boolean: true表示用户自评答案正确，false表示用户自评答案错误
     */
    const isUserSelfCorrect = ref({}); 
    
    /**
     * 用户是否已查看参考答案的状态
     * 格式: {questionId: boolean}
     * questionId: 题目ID
     * boolean: true表示用户已查看参考答案，false表示用户未查看参考答案
     */
    const hasViewedReferenceAnswer = ref({});

    // ================ 方法定义 ================
    
    /**
     * 保存用户答案
     * @param {string} questionId - 题目ID
     * @param {string|Array} answer - 用户答案
     * 流程:
     * 1. 将用户答案存储到userAnswers中
     * 2. 如果该题目尚未记录在已答列表中，则添加到answeredQuestions
     */
    const saveUserAnswer = (questionId, answer) => {
        userAnswers.value[questionId] = answer;
        if (!answeredQuestions.value.includes(questionId)) {
            answeredQuestions.value.push(questionId);
        }
    };
    
    /**
     * 保存参考答案
     * @param {string} questionId - 题目ID
     * @param {string|Array} referenceAnswer - 参考答案
     * 通常在题目加载时调用，用于后续的用户自评参考
     */
    const saveReferenceAnswer = (questionId, referenceAnswer) => {
        referenceAnswers.value[questionId] = referenceAnswer;
    };
    
    /**
     * 保存用户自评结果
     * @param {string} questionId - 题目ID
     * @param {boolean} isCorrect - 用户自评是否正确
     * 用户查看参考答案后，自行判断答案是否正确
     */
    const saveUserSelfEvaluation = (questionId, isCorrect) => {
        isUserSelfCorrect.value[questionId] = isCorrect;
        // 标记用户已查看参考答案
        hasViewedReferenceAnswer.value[questionId] = true;
    };
    
    /**
     * 标记用户已查看参考答案
     * @param {string} questionId - 题目ID
     * 用户点击查看参考答案时调用
     */
    const markViewedReferenceAnswer = (questionId) => {
        hasViewedReferenceAnswer.value[questionId] = true;
    };
    
    /**
     * 获取用户答案
     * @param {string} questionId - 题目ID
     * @returns {string|Array} 用户答案
     */
    const getUserAnswer = (questionId) => {
        return userAnswers.value[questionId];
    };
    
    /**
     * 获取参考答案
     * @param {string} questionId - 题目ID
     * @returns {string|Array} 参考答案
     */
    const getReferenceAnswer = (questionId) => {
        return referenceAnswers.value[questionId];
    };
    
    /**
     * 获取用户自评是否正确
     * @param {string} questionId - 题目ID
     * @returns {boolean} 用户自评是否正确
     */
    const getUserSelfEvaluation = (questionId) => {
        return isUserSelfCorrect.value[questionId];
    };
    
    /**
     * 获取用户是否已查看参考答案
     * @param {string} questionId - 题目ID
     * @returns {boolean} 用户是否已查看参考答案
     */
    const getHasViewedReferenceAnswer = (questionId) => {
        return hasViewedReferenceAnswer.value[questionId];
    };
    
    /**
     * 清空所有答案
     * 通常在考试结束或重新开始考试时调用
     * 重置所有状态到初始值
     */
    const clearAllAnswers = () => {
        userAnswers.value = {};
        answeredQuestions.value = [];
        referenceAnswers.value = {};
        isUserSelfCorrect.value = {};
        hasViewedReferenceAnswer.value = {};
    };
    
    /**
     * 获取已答题但未自评的题目ID列表
     * @returns {Array} 未自评的题目ID列表
     */
    const getUnEvaluatedQuestions = () => {
        return answeredQuestions.value.filter(questionId => 
            !hasViewedReferenceAnswer.value[questionId]
        );
    };

    // ================ 导出的状态和方法 ================
    return {
        userAnswers,
        answeredQuestions,
        referenceAnswers,
        isUserSelfCorrect,
        hasViewedReferenceAnswer,
        saveUserAnswer,
        saveReferenceAnswer,
        saveUserSelfEvaluation,
        markViewedReferenceAnswer,
        getUserAnswer,
        getReferenceAnswer,
        getUserSelfEvaluation,
        getHasViewedReferenceAnswer,
        clearAllAnswers,
        getUnEvaluatedQuestions
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
            }
        }
    }
});