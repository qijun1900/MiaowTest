const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuse.js')
const NewsModel = require('../../models/NewsModel')
const testapi = require('../../llm/test.js')


const ExamService = {
    getExamList: async () => {
        return ExamModel.find({isPublish:1}).sort({createdTime:-1})
    },
    getOneExam: async (id) => {
        return ExamModel.findById(id)
    },
    getUserExamInfo: async (id) => {
        return UserExamModel.find({ examId: id }, { questionTitle: 1 });
    },
    postUserExamIssuse: async (ExamId, ExamtagId,Type, createdTime) => {
        return UserIssuseModel.create({ ExamId, ExamtagId, Type, createdTime});
    },
    getSwipeNews: async () => {
        return NewsModel.find({isPublish:1}).sort({createdTime:-1})
    },
    chat: async (message) => {
        return await testapi.chat(message);
    }
}
module.exports = ExamService