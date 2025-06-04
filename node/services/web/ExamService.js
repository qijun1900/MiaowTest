const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuse.js')
const NewsModel = require('../../models/NewsModel')
const testapi = require('../../llm/test.js')
const  chat = require('../../llm/web/chat.js')


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
        return await UserIssuseModel.create({ ExamId, ExamtagId, Type, createdTime});
    },
    getSwipeNews: async () => {
        return await NewsModel.find({isPublish:1}).sort({createdTime:-1})
    },
    chat: async (message) => {
        return await testapi.chat(message);
    },
    sendExamAIanalyse: async (message,QuestionID) => {
       const result =  await chat.postExamAIanalyse(message);
       return result;
    }
}
module.exports = ExamService