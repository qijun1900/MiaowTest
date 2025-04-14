const ExamModel = require('../../models/ExamModel')
const ExamService ={
    add:async({name,code,category,year,isPublish,cover,createdTime})=>{
        return ExamModel.create({
            name,
            code,
            category,
            year,
            isPublish,
            cover,
            createdTime
        })
    },
    getexamList:async({_id})=>{
        return _id?ExamModel.find({_id:id}):ExamModel.find({}).sort({createdTime:-1})
    },

}
module.exports = ExamService