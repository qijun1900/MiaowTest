import { defineStore } from "pinia";
import { useObjectiveAnswerStore } from "./ObjectiveAnswerStore";
import { useSubjectiveAnswerStore } from "./SubjectiveAnswerStore";
import { useQuestionStore } from "./QuestionStore";

import { computed } from "vue";

export const useStatisticsStore = defineStore("statistics", () => {
    // ================ 状态定义 ================
    const ObjectiveAnswerStore = useObjectiveAnswerStore();
    const SubjectiveAnswerStore = useSubjectiveAnswerStore();
    const QuestionStore = useQuestionStore();

    // ================ 计算属性 ================
    // 计算答对次数
    const correctCount = computed(() => {
        // 统计客观题答对次数
        let objectiveCorrect = 0;
        ObjectiveAnswerStore.answeredQuestions.forEach(questionId => {
            if (ObjectiveAnswerStore.getIsAnswerCorrect(questionId)) {
                objectiveCorrect++;
            }
        });

        // 统计主观题答对次数
        let subjectiveCorrect = 0;
        SubjectiveAnswerStore.answeredQuestions.forEach(questionId => { //answeredQuestions, 主观题已答题目ID列表,没有输入答案不能算
            const selfEvaluation = SubjectiveAnswerStore.getUserSelfEvaluation(questionId);
            // 只有当用户明确自评为正确时才计入答对次数
            if (selfEvaluation === true) {
                subjectiveCorrect++;
            }
        });

        return objectiveCorrect + subjectiveCorrect;
    });

    // 计算答错次数
    const incorrectCount = computed(() => {
        // 统计客观题答错次数
        let objectiveIncorrect = 0;
        ObjectiveAnswerStore.answeredQuestions.forEach(questionId => {
            if (!ObjectiveAnswerStore.getIsAnswerCorrect(questionId)) {
                objectiveIncorrect++;
            }
        });

        // 统计主观题答错次数
        let subjectiveIncorrect = 0;
        SubjectiveAnswerStore.answeredQuestions.forEach(questionId => { //answeredQuestions, 主观题已答题目ID列表,没有输入答案不能算
            const selfEvaluation = SubjectiveAnswerStore.getUserSelfEvaluation(questionId);
            // 只有当用户明确自评为错误时才计入答错次数
            if (selfEvaluation === false) {
                subjectiveIncorrect++;
            }
        });

        return objectiveIncorrect + subjectiveIncorrect;
    });

    // 计算未答题次数
const unansweredCount = computed(() => {
    const totalQuestions = QuestionStore.UserChooseQuestion.length;
    const answeredQuestions = new Set([
        ...ObjectiveAnswerStore.answeredQuestions,
        ...SubjectiveAnswerStore.answeredQuestions
    ]).size;
    return totalQuestions - answeredQuestions;
});

    // 计算正确率
    const accuracyRate = computed(() => {
        const totalAnswered = correctCount.value + incorrectCount.value;
        if (totalAnswered === 0) return 0;

        // 计算正确率，保留一位小数
        return Math.round((correctCount.value / totalAnswered) * 1000) / 10;
    });

    return {
        correctCount,
        incorrectCount,
        accuracyRate,
        unansweredCount,
    }
},
    // ================ 持久化配置 ================
    /**
     * 持久化配置
     * 使Store的状态能够在页面刷新后保持
     * 同时支持小程序和H5页面的存储方式
     */
    {
        //持久化配置，同时支持小程序和H5
        persist: {
            storage: {
                /**
                 * 获取存储数据
                 * @param {string} key - 存储的键名
                 * @returns {any} 存储的数据
                 * 根据环境选择不同的存储API:
                 * - H5页面: 使用localStorage
                 * - 小程序: 使用uni.getStorageSync
                 */
                getItem(key) {
                    return typeof window !== 'undefined'
                        ? localStorage.getItem(key)
                        : uni.getStorageSync(key);
                },
                /**
                 * 设置存储数据
                 * @param {string} key - 存储的键名
                 * @param {any} value - 要存储的数据
                 * 根据环境选择不同的存储API:
                 * - H5页面: 使用localStorage
                 * - 小程序: 使用uni.setStorageSync
                 */
                setItem(key, value) {
                    return typeof window !== 'undefined'
                        ? localStorage.setItem(key, value)
                        : uni.setStorageSync(key, value);
                }
            }
        }
    });