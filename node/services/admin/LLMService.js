const LLMModel = require("../../models/LLMsModel");
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')
const chat = require("../../llm/admin/Chat/chat")
const modelapp = require("../../llm/admin/ModelApp/test")


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
            const data = await modelapp.AutoAddQuestion(message);

            // 移除Markdown代码块标记
            const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log('Clean data:',cleanData)
            // 解析JSON数据
            const jsonData = JSON.parse(cleanData);
            console.log("jsondata",jsonData)
            
            const updatedQuestions = jsonData.map(item => {
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
            
            return { success: true, message: '数据插入成功',count: updatedQuestions.length };
        } catch (error) {
            console.error('数据插入失败:', error);
            return { success: false, message: '数据插入失败' };
        }
    }
}
module.exports = LLMService