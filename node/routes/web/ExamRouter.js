var express = require('express');
const ExamController = require('../../controllers/web/ExamController');
var ExamRouter = express.Router();




//涉及文件上传
ExamRouter.get('/webapi/Exam/getExamList',ExamController.getExamList)//获取考试列表
ExamRouter.get("/webapi/Exam/getOneExam/:id",ExamController.getOneExam)//获取单个考试详情
ExamRouter.get("/webapi/Exam/getUserExamInfo/:id",ExamController.getUserExamInfo)//获取用户要使用单个考试信息
ExamRouter.post("/webapi/UserExam/postUserExamIssuse/:id",ExamController.postUserExamIssuse)//用户端提交考试错误信息
ExamRouter.get("/webapi/News/getSwipeNews",ExamController.getSwipeNews)//获取轮播图
ExamRouter.post("/webapi/testapi/chat",ExamController.chat)//测试接口
ExamRouter.post("/webapi/user/postUserAdvice",ExamController.UserFeedbackAdvice)//用户反馈接口
ExamRouter.post("/webapi/user/postUserQuestionIssuse",ExamController.postUserQuestionIssuse)//用户反馈题目问题接口



module.exports = ExamRouter; 