const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuse.js')
const NewsModel = require('../../models/NewsModel')
const testapi = require('../../llm/test.js')
const  chat = require('../../llm/web/chat.js')
const AianalysisModel = require('../../models/AianalysisModel')
const UserFeedbackModel = require('../../models/UserFeedbackModel')


const ExamService = {
    getExamList: async () => {
        return await ExamModel.find({isPublish:1}).sort({createdTime:-1})
    },
    getOneExam: async (id) => {
        return await ExamModel.findById(id)
    },
    getUserExamInfo: async (id) => {
        return await UserExamModel.find({ examId: id }, { questionTitle: 1 });
    },
    postUserExamIssuse: async (ExamId, ExamtagId,Type, createdTime) => {
        return await UserIssuseModel.create({ 
            ExamId,
            ExamtagId, 
            Type, 
            IsSolved,
            createdTime});
    },
    getSwipeNews: async () => {
        return await NewsModel.find({isPublish:1}).sort({createdTime:-1})
    },
    chat: async (message) => {
        return await testapi.chat(message);
    },
    sendExamAIanalyse: async (message, questionId,Type) => { 
        // 先查询数据库
        const existingAnalysis = await AianalysisModel.findOne({ questionId });
        if (existingAnalysis) {
            return existingAnalysis.analysecontent;
        }
        
        // 如果没有找到，调用AI接口
        const result = await chat.postExamAIanalyse(message);
        
        // 将结果存入数据库
        await AianalysisModel.create({
            questionId,
            questionType: Type, // 添加题目类型
            questionContent: message, // 添加题目内容
            analysecontent: result,// 添加分析内容
            createdTime: new Date(),
            modelName: 'deepseek-v3' // 添加模型名称
        });
        return result;
    },
    UserFeedbackAdvice: async ({useradvice,userinfo,type,IsSolved,createtime}) => {
        return await UserFeedbackModel.create({
            userAdvice:useradvice,
            userInfo:userinfo,
            Type:type,
            IsSolved,
            createdTime:createtime
        })
        
    }
}
module.exports = ExamService