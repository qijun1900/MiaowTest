const ExamService = require("../../services/user/ExamService");

const ExamController ={
    getExamList:async (req,res)=>{
        try {
            const result = await ExamService.getExamList()
            res.send({
                code:200,
                ActionType: "OK",
                data: result 
            })
        }catch (error) {
            console.error('Error fetching getExamList details:', error); // 处理错误
        }
    },
    getOneExam:async (req,res)=>{
        try {
            const id = req.params.id;
            const result = await ExamService.getOneExam(id) 
            res.send({
                code:200,
                ActionType: "OK",
                data: result 
            })
        } catch (error) {
            console.error('Error fetching getOneExam details:', error); // 处理错误 
        }
    },
    getUserExamInfo:async (req,res)=>{
        try {
            const id = req.params.id;
            const result = await ExamService.getUserExamInfo(id) 
            res.send({
                code:200,
                ActionType: "OK",
                data: result
            })
        } 
        catch (error) {
            console.error('Error fetching getUserExamInfo details:', error); // 处理错误 
        }
    },
    postUserExamIssuse:async (req,res)=>{
        try {
            const ExamId =req.params.id; // 从请求参数中获取ExamId
            const { ExamtagId,Type } = req.body; // 从请求体中获取ExamtagId
            await ExamService.postUserExamIssuse(
                ExamId, 
                ExamtagId,
                IsSolved=1,
                Type,
                new Date()
            )
            res.send({
                code:200,
                ActionType: "OK",
            })
        }catch (error) {
            console.error('Error fetching postUserExamIssuse details:', error); // 处理错误
        }

    },
    getSwipeNews:async (req,res)=>{
        try {
            const result = await ExamService.getSwipeNews()
            res.send({
                code:200,
                ActionType: "OK",
                data: result
            })
        }catch (error) {
            console.error('Error fetching getSwipeNews details:', error); // 处理错误
        }
    },
    UserFeedbackAdvice:async (req,res)=>{
        try {
            const {useradvice,userinfo,type} = req.body; // 从请求体中获取问题和题目ID,如果QuestionID不存在，则调用大模型api获得
            console.log("用户输入的问题:", useradvice, "用户信息:", userinfo, "类型:", type);
            const result = await ExamService.UserFeedbackAdvice({
                useradvice,
                userinfo,
                type,
                IsSolved: 1,
                createtime: new Date()

            }) // 调用服务层的sendExamAIanalyse方法
           res.send({
                code: 200,
                ActionType: "OK",
                data: result 
            });
        }catch (error) {
            console.error('Error fetching UserFeedbackAdvice details:', error); // 处理错误 
        } 
    }, 
    postUserQuestionIssuse:async (req,res)=>{
        try {
            const {ExamtagId,Type,userQuestion,stem,questionId,ExamId} = req.body; // 从请求体中获取问题和题目ID,如果QuestionID不存在，则调用大模型api获得
            console.log("用户输入的问题:", userQuestion, "题目ID:", questionId, "类型:", Type, "考试ID:", ExamId, "标签ID:", ExamtagId);
            const result = await ExamService.postUserQuestionIssuse({
                ExamtagId,
                Type,
                userQuestion,
                stem,
                questionId,
                ExamId,
                IsSolved:1,
                createdTime:new Date()
            })
            res.send({
                code: 200,
                ActionType: "OK",
                data: result 
            })
        }catch (error) {
            console.error('Error fetching postUserQuestionIssuse details:', error); // 处理错误 
        }
        
    },
    //uniappAPI
    getHotExamList:async (req,res)=>{
        try {
            const result = await ExamService.getHotExamList()
            res.send({
                code:200,
                data: result 
            })

            
        }
        catch (error) {
            console.error('Error fetching getHotExamList details:', error); // 处理错误
        }
    },
    getExamSubjects:async (req,res)=>{
        try {
            const result = await ExamService.getExamSubjects()
            res.send({
                code:200,
                data: result 
            })
        }catch (error) {
            console.error('Error fetching getExamSubjects details:', error); // 处理错误
        }
    },
    getExamSubjectTypes:async (req,res)=>{
        try {
            const ExamSubjectId = req.params.id; // 从请求参数中获取ExamSubjectId
            const result = await ExamService.getExamSubjectTypes(ExamSubjectId) 
            res.send({
                code:200,
                data: result
            })
        }catch (error) {
            console.error('Error fetching getExamSubjectTypes details:', error); // 处理错误
        }
    },
    FetchMatchQuestionList:async (req,res)=>{
        try {
            const extractedData = req.body; 
            console.log("ExamSubjectId:", extractedData);
            const result = await ExamService.FetchMatchQuestionList(extractedData) 
            res.send({
                code: 200,
                data: result
            });
        }catch (error) {
            console.error('Error fetching FetchMatchQuestionList details:', error); // 处理错误
        }
    }
}

module.exports = ExamController