const ExamModel = require('../../models/ExamModel')

const ExamService = {
    getExamList: async () => {
        return ExamModel.find({}).sort({createdTime:-1})
    },
    getOneExam: async (id) => {
        return ExamModel.findById(id)
    }
}
module.exports = ExamService