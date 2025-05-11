const ExamModel = require('../../models/ExamModel')

const ExamService = {
    getExamList: async () => {
        return ExamModel.find({}).sort({createdTime:-1})
    }
}
module.exports = ExamService