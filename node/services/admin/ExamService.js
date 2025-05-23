const ExamModel = require('../../models/ExamModel')
const ExamSelectModel =require('../../models/SelectModel')
const ExamBlankModel =require('../../models/BlankModel')
const ExamJudgeModel =require('../../models/JudgeModel')
const ExamShortModel =require('../../models/ShortModel')
const  UserExamModel = require('../../models/UserExamModel')

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
    AddSelectQuestion:async({examId,stem,options,isPublish,analysis,isAIanswer,isAddUserList,createdTime,Type,isMultiple})=>{
        return ExamSelectModel.create({
            examId,
            stem,
            options, 
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            isMultiple,
            createdTime
        })
    },
    AddBlankQuestion :async({examId,stem,options,isPublish,analysis,isAIanswer,isAddUserList,createdTime,Type})=>{
        return ExamBlankModel.create({
            examId,
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime 
        }) 
    },
    AddJudgeQuestion :async({examId,stem,answer,isPublish,analysis,isAIanswer,isAddUserList,createdTime,Type})=>{
        return ExamJudgeModel.create({
            examId,
            stem,
            answer, 
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime
        }) 
    },
    AddShortQuestionList :async({examId,stem,content,isPublish,analysis,isAIanswer,isAddUserList,createdTime,Type})=>{
        return ExamShortModel.create({
            examId,
            stem,
            content, 
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime
        }) 
    },
    getQuestionList:async({examId,questionType,isPublish,isAddUserList})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        if(isPublish){
            return modelMap[questionType]?.find({examId,isPublish}) || null;
        }else if(isAddUserList){
            return modelMap[questionType]?.find({examId,isAddUserList}) || null; 
        }
        else{
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
    UpdateExamStatus:async({examId,isPublish})=>{
        const [examUpdate, userExamUpdate] = await Promise.all([
            ExamModel.updateOne({_id: examId}, {isPublish}),
            UserExamModel.updateOne({examId}, {isPublish})
        ]);
        
        return {
            matchedCount: examUpdate.matchedCount + userExamUpdate.matchedCount,
            modifiedCount: examUpdate.modifiedCount + userExamUpdate.modifiedCount
        }
    },
    AddUserExamInfo:async({name,questionTitle,code,isPublish,category,examId,cover,year,createdTime})=>{
        return UserExamModel.create({
            name,
            questionTitle,
            code,
            isPublish,
            category,
            examId,
            cover,
            year,
            createdTime
        }) 
    },
    UpdateUserExamInfo:async({name,questionTitle,code,isPublish,category,examId,cover,year,createdTime})=>{
        return UserExamModel.updateOne(
            { examId }, 
            { 
                $set: { // 覆盖更新普通字段
                    name,
                    code,
                    isPublish,
                    category,
                    cover,
                    year,
                    createdTime
                },
                $push: { // 追加数组字段
                    questionTitle: {
                        $each: questionTitle // 将新数组元素逐个追加
                    }
                }
            },
            { new: true }//推荐添加该配置返回更新后的文档
        ) 
    },
    getUserExamInfo:async({examId})=>{
        return UserExamModel.find({examId}) 
    },
    updateQuestionTitleStatus:async({examId,titleId,isPublishType})=>{
        return  UserExamModel.updateMany(
            { examId, "questionTitle._id": titleId },
            { 
                $set: {
                    "questionTitle.$.isPublishType": isPublishType
                }
            },
            { new: true }
        );
    },
    deleteQuestionTitle:async({examId,titleId})=>{
        return  UserExamModel.updateMany(
            { examId },
            {
                $pull: {
                    questionTitle: { _id: titleId }
                }
            },
            { new: true }
        ); 
    },
    AddSingUserList:async({examId,questionId,isAddUserList,Type,titleId,row})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        
        const [updateResult, insertResult] = await Promise.all([
            modelMap[Type]?.updateOne(
                { examId, _id: questionId },
                { $set: { isAddUserList } }
            ) || null,
            UserExamModel.updateOne(
                {   
                    examId,
                    "questionTitle._id": titleId 
                },
                { 
                    $push: {
                        'questionTitle.$.questionIdS': { $each: [row] }
                    }
                },
                { upsert: true }
            )
        ]);
        return {
            updateResult,
            insertResult
        };
    },
    RemoveSingUserList:async({examId,questionId,isAddUserList,Type,titleId,row})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }; 
        const [updateResult, deleteResult] = await Promise.all([
            modelMap[Type]?.updateOne(
                { examId, _id: questionId },
                { $set: { isAddUserList } }
            ) || null, 
            //三次匹配更新，第一次匹配examId，第二次匹配questionTitle._id，第三次匹配questionIdS._id，删除符合条件的元素
            UserExamModel.updateOne(
                {
                    examId,
                    "questionTitle._id": titleId,
                },
                {
                    $pull: {
                        "questionTitle.$.questionIdS": { _id: row._id}
                    }
                }
            )
        ])
        return {
            updateResult,
            deleteResult 
        }
    },
    batchPublishedUserQuestionsList:async({examId,Type,titleId,questionId,questionIdS})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel, 
            4: ExamShortModel
        }
        const [updateResult, insertResult] = await Promise.all([
            modelMap[Type]?.updateMany(
                { examId, _id: { $in: questionId } },
                {  $set: { isAddUserList: 1 }}
            ) || null, 
            UserExamModel.updateOne(
                { examId, "questionTitle._id": titleId },
                { $push: { "questionTitle.$.questionIdS": { $each: questionIdS } } } 
            )
        ]) 
        return {
            updateResult,
            insertResult
        }
    },
    getUserQuestionsList: async ({ examId, titleId }) => {
        // 1. 查询匹配的考试文档并投影出对应的questionTitle条目
        const userExamInfo = await UserExamModel.findOne(
            { 
                examId,  // 根据考试ID筛选
                "questionTitle._id": titleId  // 同时筛选questionTitle数组中_id匹配的条目
            },
            { 
                "questionTitle.$": 1  // 使用$投影操作符只返回匹配的questionTitle数组元素
                // 1表示包含该字段，0表示排除其他字段
            }
        );
        // 返回匹配的questionTitle条目中的questionIdS数组，如果没有则返回空数组
        // questionTitle[0]是因为$投影操作符确保只返回一个匹配的数组元素
        return userExamInfo.questionTitle[0].questionIdS || [];
    },
    
    UserquestionlistDown:async({examId,questionType,isAddUserList})=>{
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.updateMany({examId,isAddUserList},{isAddUserList:0}) || null;
    }
   
}
module.exports = ExamService