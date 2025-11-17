import { ref } from "vue";
import { defineStore } from 'pinia';
import { FetchMatchQuestionList } from "../../API/Exam/ExamAPI";

export const useQuestionStore = defineStore("question", () => {
    const QuestionIDs = ref([]); // 存储问题ID的数组
    const QuestionData = ref([]); // 存储问题的数组
    const UserChooseQuestion = ref([]); // 存储用户选择的问题的数组
    const UserShowSettings = ref({ // 存储用户显示设置的对象
        showAnswer: true, // 是否立即显示答案(默认显示 )
        showHelper: true, // 是否显示Helper (默认显示 )
        OptionRandom: false, // 是否选项乱序(默认显示 )
    });


    const QuestionIDsActions = {
        setCurrentQuestionIds: (val) => { // 定义函数，用于设置问题ID的数组
            QuestionIDs.value = val; // 将传入的值赋值给QuestionIDs.value
        },
    }

    const QuestionDataActions = {
        FetchQuestionData: async () => {
            try {  //TODO 优化题目的获取与存储
                const response = await FetchMatchQuestionList(QuestionIDs.value);
                QuestionData.value = response.data; // 存储获取的数据
            } catch (error) {
                console.error('Error fetching question details:', error);
                throw error; // 抛出错误以便上层处理
            }
        },
        SetUserBlankquestions: (val) => { // 新增方法，用于设置题目数据(用户题库题目和用户收藏题目)
            QuestionData.value = val; // 将传入的值赋值给QuestionData.value
        },
    }

    const UserShowSettingsActions = {
        setUserShowSettings: (val) => { // 定义函数，用于设置用户显示设置
            UserShowSettings.value = { 
                ...UserShowSettings.value, ...val 
            }; // 合并更新对象，保留原有属性
        },
    }

    const getter = {
        /**
         * @param {number} questionCount 题目数量
         * @param {boolean} isRandom 是否题目乱序
         * @param {boolean} isOptionRandom 是否选项乱序
         * @returns {Array} 返回处理后的题目数组
         */
        setSelectedQuestions: (questionCount, isRandom, isOptionRandom) => {
            if (!QuestionData.value || QuestionData.value.length === 0) {
                UserChooseQuestion.value = [];
                return [];
            }

            // 复制原始数组以避免修改原始数据
            let selectedQuestions = [...QuestionData.value];

            // 如果需要题目乱序
            if (isRandom) {
                // Fisher-Yates 洗牌算法
                for (let i = selectedQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
                }
            }

            // 截取指定数量的问题
            selectedQuestions = selectedQuestions.slice(0, questionCount);

            // 如果需要选项乱序
            if (isOptionRandom) {
                selectedQuestions = selectedQuestions.map(question => {
                    // 复制问题对象以避免修改原始数据
                    const newQuestion = { ...question };

                    // 如果问题有选项，则对选项进行乱序
                    // 添加条件：当Type为2时候为填空题目，不进行乱序
                    if (newQuestion.options && Array.isArray(newQuestion.options) && newQuestion.Type !== 2 ) {
                        // 修复：确保正确复制选项数组
                        const options = JSON.parse(JSON.stringify(newQuestion.options));
                        // Fisher-Yates 洗牌算法
                        for (let i = options.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [options[i], options[j]] = [options[j], options[i]];
                        }
                        newQuestion.options = options;
                    }
                    return newQuestion;
                });
            }

            // 更新用户选择的问题数组
            UserChooseQuestion.value = selectedQuestions;

            return selectedQuestions;
        },
    }

    return {
        QuestionIDs,
        QuestionData,
        UserChooseQuestion,
        UserShowSettings,
        ...QuestionIDsActions,
        ...QuestionDataActions,
        ...UserShowSettingsActions,
        ...getter,

    }
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
    }

)


