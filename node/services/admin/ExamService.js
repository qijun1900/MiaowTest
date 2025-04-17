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
        return _id?ExamModel.find({_id}):ExamModel.find({}).sort({createdTime:-1})
    },
    updateInfo:async({name,code,category,year,isPublish,createdTime,cover,_id})=>{
        if(cover){
            return ExamModel.updateOne({_id},{
                name,
                code,
                category,
                year,
                isPublish,
                createdTime,
                cover}) 
        }else{
            return ExamModel.updateOne({_id},{
                name,
                code,
                category,
                year,
                isPublish,
                createdTime})
        }
    },
    deleteInfo:async({_id})=>{
        return ExamModel.deleteOne({_id})
    }
}
module.exports = ExamService