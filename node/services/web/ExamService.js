const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')

const ExamService = {
    getExamList: async () => {
        return ExamModel.find({isPublish:1}).sort({createdTime:-1})
    },
    getOneExam: async (id) => {
        return ExamModel.findById(id)
    },
getUserExamInfo: async (id) => {
    return UserExamModel.find({ examId: id }, { questionTitle: 1 });
}
}
module.exports = ExamService