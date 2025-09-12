const LLMModel = require("../../models/LLMsModel");
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')
const chat = require("../../llm/admin/Chat/chat")
const AutoAddQuestionmodelapp = require("../../llm/admin/ModelApp/Iaa")
const AutoAnalysisQuestionmodelapp = require("../../llm/admin/ModelApp/analysis")

const LLMService = {
    addmodel: async ({modelName,modelValue,isPublish,description,creator,createdTime}) => {
        return await LLMModel.create({
            modelName,
            modelValue,
            isPublish,
            description,
            creator,
            createdTime
        })
    },
    getmodel: async ({page,size}) => {
        // 分页查询
        const skip = (page - 1) * size
        const [data, total] = await Promise.all([
            LLMModel.find({})
                .skip(skip)
                .limit(size),
            LLMModel.countDocuments({})
        ])
        return { data, total };
    },
    updateModel: async ({_id, modelName, modelValue,description,creator,editTime}) => {
        return await LLMModel.updateOne({_id},{modelName,modelValue,description,creator,editTime})
    },
    deleteOnemodel: async ({modelName,modelValue,_id}) => {
        return await LLMModel.deleteOne({_id},{modelName,modelValue})
    },
    deleteManymodel: async ({_ids}) => {
        return await LLMModel.deleteMany({_id:{$in:_ids}})
    },
    changestatus: async ({_id,state}) => {
        return await LLMModel.updateOne({_id},{isPublish:state})
       
    },
    useLLMChat: async (message,model) => {
        return await chat.postUserSingleChat(message,model)
    },
    getChatModels: async () => {
        return await LLMModel.find({isPublish:1})
    },
    BatchaddQuestion: async (message,examId,category) => {
        try {
            const data = await AutoAddQuestionmodelapp.AutoAddQuestion(message);

            // 移除Markdown代码块标记
            const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log('Clean data:',cleanData)
            // 处理可能的多JSON对象情况
            let jsonData;
            try {
                // 先尝试直接解析
                jsonData = JSON.parse(cleanData);
            } catch (e) {
                // 如果失败，尝试用数组包裹
                try {
                    jsonData = JSON.parse(`[${cleanData.replace(/}\s*{/g, '},{')}]`);
                } catch (err) {
                    console.error('JSON解析失败:', err);
                    throw new Error('数据格式错误，无法解析');
                }
            }
            console.log("jsondata",jsonData)
            
            // 确保jsonData是数组
            const questionsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            const updatedQuestions = questionsArray.map(item => {
               return {
                ...item,
                examId: examId,
                isPublish: 0,
                analysis: "",
                isAIanswer: 0,
                isAddUserList: 0,
                createdTime: new Date(),
                __v: 0
               }
            });
            
            // 根据category获取对应模型
            const modelMap = {
                1: ExamSelectModel,
                2: ExamBlankModel,
                3: ExamJudgeModel,
                4: ExamShortModel
            };
            const currentModel = modelMap[category];

            // 插入数据到对应的模型
            await currentModel.insertMany(updatedQuestions);

            return { 
                success: true, 
                message: '数据插入成功',
                count: updatedQuestions.length,
                data:updatedQuestions 
            };
        } catch (error) {
            console.error('数据插入失败:', error);
            return { success: false, message: '数据插入失败' };
        }
    },
    getQuestionAnalysis: async (message,questionType,_id) => {
        try {
            const data = await AutoAnalysisQuestionmodelapp.AutoAnalysisQuestion(message);

            // 移除Markdown代码块标记
            const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
            // 处理可能的多JSON对象情况
            let jsonData;
            try {
                // 先尝试直接解析
                jsonData = JSON.parse(cleanData);
            } catch (e) {
                // 如果失败，尝试用数组包裹
                try {
                    jsonData = JSON.parse(`[${cleanData.replace(/}\s*{/g, '},{')}]`);
                } catch (err) {
                    console.error('JSON解析失败:', err);
                    throw new Error('数据格式错误，无法解析');
                }
            }
        
            // 根据category获取对应模型
            const modelMap = {
                1: ExamSelectModel,
                2: ExamBlankModel,
                3: ExamJudgeModel,
                4: ExamShortModel
            };
            const currentModel = modelMap[questionType];
            
            // 使用currentModel和_id更新analysis字段
            if (jsonData && jsonData.analysis) {
                const updateResult = await currentModel.updateOne(
                    { _id: _id },
                    { 
                        analysis: jsonData.analysis,
                        isAIanswer: 1 // 标记为AI回答
                    }
                );

                return {
                    success: true,
                    message: '题目分析更新成功',
                };
            } else {
                return {
                    success: false,
                    message: '未获取到有效的分析内容'
                };
            }
           
        }catch (error) {
            console.error('Error fetching formatQuestion details:', error);
            return {
                success: false,
                message: '更新分析失败',
                error: error.message
            };
        }
        
    }
}
module.exports = LLMService