const  chat = require('../../llm/web/chat.js')
const AianalysisModel = require('../../models/AianalysisModel')
const LLMsModel = require('../../models/LLMsModel')


const LLMService = {
    sendExamAIanalyse: async (message, questionId,Type,model) => { 
        // 先查询数据库，同时匹配questionId和modelName，如果存在，直接返回分析结果
        const existingAnalysis = await AianalysisModel.findOne({ 
            questionId,
            modelName: model 
        });
        if (existingAnalysis) {
            return {
                Aidata: existingAnalysis.analysecontent ,
                modelName:existingAnalysis.modelName,
            }
        }
        
        // 如果没有找到，调用AI接口
        const result = await chat.postExamAIanalyse(message,model);
        
        // 将结果存入数据库
        await AianalysisModel.create({
            questionId,
            questionType: Type, // 添加题目类型
            questionContent: message, // 添加题目内容
            analysecontent: result.Aidata,// 添加分析内容
            createdTime: new Date(),
            modelName: result.modelName // 添加模型名称
        });
        return result;
    },
    UserChat: async (message,model) => {
        return await chat.postUserChat(message,model)
    },
    getLLMList: async () => {
        return await LLMsModel.find({ isPublish: 1 })
    }

}
module.exports = LLMService
