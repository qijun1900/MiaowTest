const ExamModel = require('../../models/ExamModel')
const ExamSelectModel =require('../../models/SelectModel')
const ExamBlankModel =require('../../models/BlankModel')
const ExamJudgeModel =require('../../models/JudgeModel')
const ExamShortModel =require('../../models/ShortModel')
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
    },
    AddSelectQuestion:async({examId,stem,options,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamSelectModel.create({
            examId,
            stem,
            options, 
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        })
    },
    AddBlankQuestion :async({examId,stem,options,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamBlankModel.create({
            examId,
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            createdTime 
        }) 
    },
    AddJudgeQuestion :async({examId,stem,answer,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamJudgeModel.create({
            examId,
            stem,
            answer, 
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        }) 
    },
    AddShortQuestionList :async({examId,stem,content,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamShortModel.create({
            examId,
            stem,
            content, 
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        }) 
    },
    getQuestionList:async({examId,questionType,isPublish})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        if(isPublish){
            return modelMap[questionType]?.find({examId,isPublish}) || null;
        }else{
            return modelMap[questionType]?.find({examId}) || null;
        }
    },
    UpdateOneQuestion:async({_id,isPublish,questionType})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }; 
        return modelMap[questionType]?.updateOne({_id},{isPublish}) || null;
    },
    UpdateBatchQuestion:async({ids,isPublish,questionType})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.updateMany({_id: {$in: ids}},{isPublish}) || null;
    },
    DeleteQuestion:async({_id,questionType})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.deleteOne({_id}) || null;
    },
    getQuestionInfo:async({_id,questionType})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }; 
        return modelMap[questionType]?.find({_id}) || null;
    },
    UpdateSelectQuestion:async({_id,stem,options,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamSelectModel.updateOne({_id},{
            stem,
            options,
            isPublish, 
            analysis,
            isAIanswer,
            createdTime
        }) 
    },
    UpdateBlankQuestion:async({_id,stem,options,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamBlankModel.updateOne({_id},{
            stem,
            options,
            isPublish, 
            analysis,
            isAIanswer,
            createdTime
        }) 
    },
    UpdateJudgeQuestion:async({_id,stem,answer,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamJudgeModel.updateOne({_id},{
            stem,
            answer,
            isPublish, 
            analysis,
            isAIanswer,
            createdTime
        }) 
    },
    UpdateShortQuestionList:async({_id,stem,content,isPublish,analysis,isAIanswer,createdTime})=>{
        return ExamShortModel.updateOne({_id},{
            stem,
            content,
            isPublish, 
            analysis,
            isAIanswer,
            createdTime,
        }) 
    },
    

    
}
module.exports = ExamService