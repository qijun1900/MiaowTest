import { ref } from "vue";
import { defineStore } from 'pinia';
import { FetchMatchQuestionList } from "../../API/Exam/ExamAPI";

export const useQuestionStore = defineStore("question", () => {
    const QuestionIDs = ref([]); // 存储问题ID的数组
    const QuestionData = ref([]); // 存储问题的数组

    const QuestionIDsActions = {
        setCurrentQuestionIds: (val) => { // 定义函数，用于设置问题ID的数组
            QuestionIDs.value = val; // 将传入的值赋值给QuestionIDs.value
        },
    }
    const QuestionDataActions = {
        FetchQuestionData: async () => { 
            // const extractedData = QuestionIDs.value.map(item => ({
            //     questionId: item._id,
            //     category: item.category
            // }));

            try {
                const response = await FetchMatchQuestionList(QuestionIDs.value);
                QuestionData.value = response.data; // 存储获取的数据
                return response.data;
            } catch (error) {
                console.error('Error fetching question details:', error);
                throw error; // 抛出错误以便上层处理
            }
        }
    }

    return {
        QuestionIDs,
        QuestionData,
        ...QuestionIDsActions,
        ...QuestionDataActions
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


