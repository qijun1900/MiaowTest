const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuseModel.js')
const NewsModel = require('../../models/NewsModel')
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
    UserFeedbackAdvice: async ({useradvice,userinfo,type,IsSolved,createtime}) => {
        return await UserFeedbackModel.create({
            userAdvice:useradvice,
            userInfo:userinfo,
            Type:type,
            IsSolved,
            createdTime:createtime
        })
        
    },
    postUserQuestionIssuse: async ({ExamtagId,Type,userQuestion,stem,questionId,ExamId,IsSolved,createdTime}) => {
        return await UserIssuseModel.create({
            ExamtagId,Type,userQuestion,stem,questionId,ExamId,IsSolved,createdTime
        })
    }

}
module.exports = ExamService