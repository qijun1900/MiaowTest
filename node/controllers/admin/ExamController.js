const ExamService = require("../../services/admin/ExamService");

const ExamController ={
    ExamAdd:async (req,res) => {
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,category,code,year,isPublish,creator,day } = req.body
        const parsedCategory = JSON.parse(category).map(Number)
        console.log(name,parsedCategory,code,year,isPublish,cover,creator,day)
        await ExamService.ExamAdd({
            name,
            category:parsedCategory,
            code,
            year,
            isPublish:Number(isPublish),
            cover,
            creator,
            day,
            createdTime:new Date()
        })
        res.send({
            ActionType: "OK",
        }) 
    },
    getexamList:async (req,res)=>{
        const {page,size} = req.query
        const result = await ExamService.getexamList({
            page: Number(page),
            size: Number(size)
        })
        res.send({
            ActionType: "OK",
            data: result,
            code:200,
        })   
    },
    updateInfo:async(req,res)=>{
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,code,category,year,isPublish,creator,day,_id} = req.body
        const parsedCategory = JSON.parse(category).map(Number)
        await ExamService.updateInfo({
            name,
            category:parsedCategory,
            code,
            year,
            isPublish:Number(isPublish),
            cover,
            creator,
            day,
            createdTime:new Date(),
            _id
        })
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    updateExamStatus:async(req,res)=>{
        const {_id,state} = req.body
        await ExamService.updateExamStatus({_id,state:Number(state)})
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    deleteOneExamInfo:async(req,res)=>{
        const {_id} = req.body
        await ExamService.deleteOneExamInfo({_id})
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    deleteManyExamInfo:async(req,res)=>{
        const {_ids} = req.body
        console.log(_ids)
        await ExamService.deleteManyExamInfo({_ids})
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    AddSelectQuestion:async(req,res)=>{
        const {examId,stem,options,isPublish,analysis,isAIanswer,isAddUserList,isMultiple,Type} = req.body
        await ExamService.AddSelectQuestion({
            examId,
            stem,
            options,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            isAddUserList:Number(isAddUserList),
            Type:Number(Type),
            isMultiple:Number(isMultiple),
            createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getSelectQuestionList:async(req,res)=>{
        const {page,size,examId,questionType} = req.query
        const result = await ExamService.getSelectQuestionList({
            page: Number(page),
            size: Number(size),
            examId,
            questionType:Number(questionType)
        })
        res.send({
            code:200,
            ActionType: "OK",
            data: result,
        })
    },
    AddBlankQuestion:async(req,res)=>{
        const {examId,stem,options,isPublish,analysis,isAIanswer,isAddUserList,Type} = req.body
        await ExamService.AddBlankQuestion({
            examId,
            stem,
            options,
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            isAddUserList:Number(isAddUserList),
            Type:Number(Type),
            createdTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    AddJudgeQuestion:async(req,res)=>{
        const {examId,stem,answer,isPublish,analysis,isAIanswer,isAddUserList,Type} = req.body 
        await ExamService.AddJudgeQuestion({
            examId,
            stem,
            answer:Number(answer),
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            isAddUserList:Number(isAddUserList),
            Type:Number(Type),
            createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    AddShortQuestionList:async(req,res)=>{
        const {examId,stem,content,isPublish,analysis,isAIanswer,isAddUserList,Type} = req.body
        await ExamService.AddShortQuestionList({
            examId,
            stem,
            content,  
            isPublish:Number(isPublish),
            analysis,
            isAIanswer:Number(isAIanswer),
            isAddUserList:Number(isAddUserList),
            Type:Number(Type),
            createdTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateOneQuestion:async(req,res)=>{
        const{_id,isPublish,questionType} = req.body
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
        const {Ids,questionType} = req.body;
        console.log("ss",Ids,questionType)
        await ExamService.UpdateBatchQuestion({Ids,questionType})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    DeleteOneQuestion:async(req,res)=>{
        const {_id,questionType} = req.body
        await ExamService.DeleteOneQuestion({_id,questionType})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    DeleteManyQuestion:async(req,res)=>{
        const {Ids,questionType} = req.body
        await ExamService.DeleteManyQuestion({Ids,questionType})
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
        const {_id} = req.query
        const {stem,options,isPublish,analysis,isAIanswer,isMultiple} = req.body
        await ExamService.UpdateSelectQuestion({
           _id,
           stem,
           options,
           isPublish:Number(isPublish),
           analysis,
           isAIanswer:Number(isAIanswer),
           isMultiple:Number(isMultiple),
           createdTime:new Date()
        })
        res.send({
            code:200,
            ActionType:"OK", 
        })
    },
    UpdateBlankQuestion:async(req,res)=>{
        const {_id} = req.query
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
        const {_id} = req.query
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
        const {_id} =  req.query
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
    AddquestionTitle:async(req,res)=>{
        const {content,description,isPublish,questionIdS,examId} = req.body
        await ExamService.AddquestionTitle({
            content,
            description,
            questionIdS:questionIdS,
            isPublish:Number(isPublish),
            examId
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getQuestionTitle:async(req,res)=>{
        const {page,size,examId} = req.query
        const result = await ExamService.getQuestionTitle({
            page: Number(page),
            size: Number(size),
            examId,
        })
        res.send({
            code:200,
            ActionType:"OK",
            data: result,
        })
    },
    UpdateQuestionTitle:async(req,res)=>{
        const {content,description,examId,_id} = req.body 
        console.log(content,description,examId,_id)
        await ExamService.UpdateQuestionTitle({
            content,
            description,
            examId,
            _id,
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    DeleteOneQuestionTitle:async(req,res)=>{
        const {_id,examId} = req.body
        await ExamService.DeleteOneQuestionTitle({_id,examId})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    DeleteManyQuestionTitle:async(req,res)=>{
        const {_ids,examId} = req.body
        await ExamService.DeleteManyQuestionTitle({_ids,examId})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    UpdateOneQuestionTitleState:async(req,res)=>{
        const {_id, examId, state} = req.body
        await ExamService.UpdateOneQuestionTitleState({_id,examId,isPublish:Number(state)})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getAddQusetionList:async(req,res)=>{
        const {category,examId} = req.query
        console.log("ss",category,examId)
        const result = await ExamService.getAddQusetionList({
            category:Number(category),
            examId,
        })
        res.send({
            code:200,
            ActionType:"OK",
            data:result,
        })
    },
    AddOneQuestion:async(req,res)=>{
        const {_id, examId,category,QuestionTitleId} = req.body
        await ExamService.AddOneQuestion({_id,examId,category,QuestionTitleId})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    AddManyQuestion:async(req,res)=>{
        const {_ids,examId,category,QuestionTitleId} = req.body
        await ExamService.AddManyQuestion({_ids,examId,category,QuestionTitleId})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getCheckQusetionList:async(req,res)=>{
        const {examId,QuestionTitleId} = req.query
        const result = await ExamService.getCheckQusetionList({examId,QuestionTitleId})
        res.send({
            code:200,
            ActionType:"OK",
            data:result,
        })
    },
    MatchQusetionList:async(req,res)=>{
        const {extractedData} = req.body
        const result = await ExamService.MatchQusetionList({extractedData})
        res.send({
            code:200,
            ActionType:"OK",
            data:result,
        })
    },
    RemoveUserQuestionList:async(req,res)=>{
        const {chooseInfo,examId,QuestionTitleId} = req.body
        await ExamService.RemoveUserQuestionList({chooseInfo,examId,QuestionTitleId})
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    batchPublishedUserQuestionsList:async(req,res)=>{
        const {examId,Type,titleId,questionId,questionIdS} = req.body
        await ExamService.batchPublishedUserQuestionsList({
            examId,
            Type,
            titleId,
            questionId,//用于题库的更新，二次匹配
            questionIdS,
        })
        res.send({
            code:200,
            ActionType:"OK",
        })
    },
    getUserQuestionsList:async(req,res)=>{
        const result = await ExamService.getUserQuestionsList(
            {
                examId: req.params.id,  // 从URL参数获取examId
                titleId: req.query.titleId,  // 从查询参数获取titleId
            }
        )
        res.send({
            code:200,
            ActionType:"OK",
            data:result,
        })
    },
    UserquestionlistDown:async(req,res)=>{
        const {questionType,isAddUserList} = req.body
        const result = await ExamService.UserquestionlistDown({
            examId:req.params.id,
            questionType,
            isAddUserList,
        })
        res.send({
            code:200,
            ActionType:"OK",
            data:result, 
        })

    }
}
module.exports = ExamController