var express = require('express');
const ExamController = require('../../controllers/user/ExamController');
var ExamRouter = express.Router();


//涉及文件上传
ExamRouter.get('/webapi/Exam/getExamList',ExamController.getExamList)//获取考试列表
ExamRouter.get("/webapi/Exam/getOneExam/:id",ExamController.getOneExam)//获取单个考试详情
ExamRouter.get("/webapi/Exam/getUserExamInfo/:id",ExamController.getUserExamInfo)//获取用户要使用单个考试信息
ExamRouter.post("/webapi/UserExam/postUserExamIssuse/:id",ExamController.postUserExamIssuse)//用户端提交考试错误信息
ExamRouter.get("/webapi/News/getSwipeNews",ExamController.getSwipeNews)//获取轮播图
ExamRouter.post("/webapi/user/postUserAdvice",ExamController.UserFeedbackAdvice)//用户反馈接口
ExamRouter.post("/webapi/user/postUserQuestionIssuse",ExamController.postUserQuestionIssuse)//用户反馈题目问题接口

ExamRouter.get("/uniappAPI/get/test",(req,res)=>{
    console.log(req.clientInfo.sourceClient)
    if(req.clientInfo.sourceClient === "web"){
        res.send({code:200,ActionType:"OK",data:"web请求成功"})
        return;
    }
    if(req.clientInfo.sourceClient === "miniapp"){
        res.send({code:200,ActionType:"OK",data:"miniapp请求成功"})
        return;
    }
})
//uniappAPI
ExamRouter.get("/uniappAPI/IndexHotExam/getHotExamList",ExamController.getHotExamList)//获取热门考试
ExamRouter.get("/uniappAPI/Exam/getExamSubjects",ExamController.getExamSubjects)//获取所有考试科目
ExamRouter.get("/uniappAPI/Exam/getExamSubjectTypes/:id",ExamController.getExamSubjectTypes)//获取单个考试科目下的所有考试题型
module.exports = ExamRouter; 