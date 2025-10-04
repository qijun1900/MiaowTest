var express = require('express');
const ExamController = require('../../controllers/user/ExamController');
var ExamRouter = express.Router();
const JWT = require('../../MiddleWares/jwt');// 引入JWT中间件，用于验证token



//涉及文件上传
ExamRouter.get('/webapi/Exam/getExamList',ExamController.getExamList)//获取考试列表
ExamRouter.get("/webapi/Exam/getOneExam/:id",ExamController.getOneExam)//获取单个考试详情
ExamRouter.get("/webapi/Exam/getUserExamInfo/:id",ExamController.getUserExamInfo)//获取用户要使用单个考试信息
ExamRouter.post("/webapi/UserExam/postUserExamIssuse/:id",ExamController.postUserExamIssuse)//用户端提交考试错误信息
ExamRouter.get("/webapi/News/getSwipeNews",ExamController.getSwipeNews)//获取轮播图
ExamRouter.post("/webapi/user/postUserAdvice",ExamController.UserFeedbackAdvice)//用户反馈接口
ExamRouter.post("/webapi/user/postUserQuestionIssuse",ExamController.postUserQuestionIssuse)//用户反馈题目问题接口

//uniappAPI
ExamRouter.get("/uniappAPI/IndexHotExam/getHotExamList",ExamController.getHotExamList)//获取热门考试
ExamRouter.get("/uniappAPI/Exam/getExamSubjects",ExamController.getExamSubjects)//获取所有考试科目
ExamRouter.get("/uniappAPI/Exam/getExamSubjectTypes/:id",ExamController.getExamSubjectTypes)//获取单个考试科目下的所有考试题型
ExamRouter.post("/uniappAPI/Exam/FetchMatchQuestionList",ExamController.FetchMatchQuestionList)//获取匹配的题目题
ExamRouter.post("/uniappAPI/exam/useradd/question",JWT.verifyTokenMiddleware(),ExamController.useraddquestion)//用户添加自己的题目
ExamRouter.post("/uniappAPI/exam/AddUserBank",JWT.verifyTokenMiddleware(),ExamController.AddUserBank)//用户添加自己的题库
ExamRouter.get("/uniappAPI/Exam/getUserBankList",JWT.verifyTokenMiddleware(),ExamController.getUserBankList)//获取用户的题库列表
ExamRouter.get("/uniappAPI/exam/getUserBankQuestionList/:id",JWT.verifyTokenMiddleware(),ExamController.getUserBankQuestionList)//获取用户的题库题目
ExamRouter.post("/uniappAPI/exam/userupdate/question",JWT.verifyTokenMiddleware(),ExamController.userUpdateQuestion)//用户更新自己的题目
ExamRouter.post("/uniappAPI/exam/userdelete/question",JWT.verifyTokenMiddleware(),ExamController.userDeleteQuestion)//用户删除自己的题目

module.exports = ExamRouter; 