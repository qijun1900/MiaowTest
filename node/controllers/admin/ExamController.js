const ExamService = require("../../services/admin/ExamService");

const ExamController ={
    add:async (req,res) => {
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,code,category,year,isPublish } = req.body
        // 修复：解析JSON字符串并转换为数字数组
        const parsedCategory = JSON.parse(category).map(Number)
        await ExamService.add({
            name,
            code,
            category: parsedCategory, // 使用转换后的数组
            year,
            isPublish:Number(isPublish),
            cover,
            createdTime:new Date()
        })
        res.send({
            ActionType: "OK",
        }) 
    },
    getexamList:async (req,res)=>{
        const result = await ExamService.getexamList({_id:req.params.id})
        res.send({
            ActionType: "OK",
            data: result
        })   
    },
    updateInfo:async(req,res)=>{
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,code,category,year,isPublish,_id} = req.body
        const parsedCategory = JSON.parse(category).map(Number)
        await ExamService.updateInfo({
            name,
            code,
            category: parsedCategory, 
            year,
            isPublish:Number(isPublish),
            createdTime:new Date(),
            cover,
            _id
        })
        res.send({
            ActionType: "OK",
        })
    },
    deleteInfo:async(req,res)=>{
        await ExamService.deleteInfo({_id:req.params.id})
        res.send({
            ActionType: "OK",
        })
    },
    AddSelectQuestion:async(req,res)=>{
        const {examId,stem,options,isPublish,analysis,isAIanswer} = req.body
        await ExamService.AddSelectQuestion({
            examId,
            stem,
            options,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    AddBlankQuestion:async(req,res)=>{
        const {examId,stem,options,isPublish,analysis,isAIanswer} = req.body
        await ExamService.AddBlankQuestion({
            examId,
            stem,
            options,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    AddJudgeQuestion:async(req,res)=>{
        const {examId,stem,answer,isPublish,analysis,isAIanswer} = req.body 
        await ExamService.AddJudgeQuestion({
            examId,
            stem,
            answer:Number(answer),
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    AddShortQuestionList:async(req,res)=>{
        const {examId,stem,content,isPublish,analysis,isAIanswer} = req.body
        await ExamService.AddShortQuestionList({
            examId,
            stem,
            content,  
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    getQuestionList:async(req,res)=>{
        const result = await ExamService.getQuestionList({
            examId:req.params.id,
            questionType:req.query.questionType,
            isPublish:req.query.isPublish
        })
        res.send({
            ActionType: "OK",
            data: result
        })
    },
    UpdateOneQuestion:async(req,res)=>{
        const {_id,isPublish} = req.body
        const questionType = req.query.questionType
        await ExamService.UpdateOneQuestion({
            _id,
            isPublish:Number(isPublish),
            questionType
        })
            
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    UpdateBatchQuestion:async(req,res)=>{
        const {ids,isPublish} = req.body
        const questionType = Number(req.query.questionType)
        await ExamService.UpdateBatchQuestion({
            ids,
            isPublish:Number(isPublish),
            questionType,
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    DeleteQuestion:async(req,res)=>{
        const questionType = Number(req.query.questionType)
        await ExamService.DeleteQuestion({
            _id: req.params.id,
            questionType
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getQuestionInfo:async(req,res)=>{
        const questionType = Number(req.query.questionType)
        const result = await ExamService.getQuestionInfo({
            _id:req.params.id,
            questionType}) 
        res.send({
            code:200,
            ActionType:"OK",
            data:result, 
        })
    },
    UpdateSelectQuestion:async(req,res)=>{
        const _id = req.params.id
        const {stem,options,isPublish,analysis,isAIanswer} = req.body
        await ExamService.UpdateSelectQuestion({
            _id,
            stem,
            options,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date(),
        }) 
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateBlankQuestion:async(req,res)=>{
        const _id = req.params.id
        const {stem,options,isPublish,analysis,isAIanswer} = req.body
        await ExamService.UpdateBlankQuestion({
            _id,
            stem,
            options, 
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date(),
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateJudgeQuestion:async(req,res)=>{
        const _id = req.params.id
        const {stem,answer,isPublish,analysis,isAIanswer} = req.body
        await ExamService.UpdateJudgeQuestion({
            _id,
            stem,
            answer:Number(answer), 
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date(),  
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateShortQuestionList:async(req,res)=>{
        const _id = req.params.id
        const {stem,content,isPublish,analysis,isAIanswer} = req.body
        await ExamService.UpdateShortQuestionList({
            _id,
            stem,
            content,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            createdTime:new Date(),
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateExamStatus:async(req,res)=>{
        const {examId,isPublish} = req.body
        await ExamService.UpdateExamStatus({
            examId,
            isPublish:Number(isPublish),
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    AddUserExamInfo:async(req,res)=>{
        const {name,questionTitle,code,isPublish,category,examId} = req.body
        await ExamService.AddUserExamInfo({
            name,
            questionTitle,
            code,
            isPublish:Number(isPublish),
            category,
            examId,
            createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    UpdateUserExamInfo:async(req,res)=>{
        const {name,questionTitle,code,isPublish,category,examId} = req.body
        await ExamService.UpdateUserExamInfo({
            name,
            questionTitle,
            code,
            isPublish:Number(isPublish),
            category,
            examId,
            createdTime:new Date()
        }) 
        res.send({
            code:302,
            ActionType:"OK", 
        })
    },
    getUserExamInfo:async(req,res)=>{
        const result = await ExamService.getUserExamInfo({examId:req.params.id})
        res.send({
            code:200,
            ActionType:"OK",
            data:result, 
        })
    },
    updateQuestionTitleStatus:async(req,res)=>{
        const {examId,titleId,isPublishType} = req.body 
        await ExamService.updateQuestionTitleStatus({
            examId,
            titleId,
            isPublishType
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    deleteQuestionTitle:async(req,res)=>{
        const {examId,titleId} = req.body
        await ExamService.deleteQuestionTitle({
            examId,
            titleId,
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    }

}
module.exports = ExamController