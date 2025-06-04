const ExamService = require("../../services/web/ExamService");

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
    chat:async (req,res)=>{
        try {
            const { message } = req.body; // 从请求体中获取问题
            console.log("用户输入的问题:",message)
            const result = await ExamService.chat(message) // 调用服务层的chat方法
            console.log(result) // 打印服务层的响应结果
            res.send({
                code:200,
                ActionType: "OK",
                data: result // 返回服务层的响应结果
            })

        }catch (error) {
            console.error('Error fetching chat details:', error); // 处理错误
        }
    },
    sendExamAIanalyse:async (req,res)=>{
        try {
            const { message, QuestionID } = req.body; // 从请求体中获取问题和题目ID,如果QuestionID不存在，则调用大模型api获得
            console.log("用户输入的问题:", message, "题目ID:", QuestionID);
            const result = await ExamService.sendExamAIanalyse(message, QuestionID); // 调用服务层的sendExamAIanalyse方法
            console.log(result); // 打印服务层的响应结果
            res.send({
                code: 200,
                ActionType: "OK",
                data: result // 返回服务层的响应结果
            });
        } 
        catch (error) {
            console.error('Error fetching sendExamAIanalyse details:', error); // 处理错误
        }

    }
}

module.exports = ExamController