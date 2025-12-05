var express = require('express');
const ExamController = require('../../controllers/user/ExamController');
var ExamRouter = express.Router();
const JWT = require('../../MiddleWares/jwt');// 引入JWT中间件，用于验证token


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
ExamRouter.post("/uniappAPI/exam/userdelete/bank",JWT.verifyTokenMiddleware(),ExamController.userDeleteBank)//用户删除自己的题库
ExamRouter.post("/uniappAPI/exam/useradd/wrongquestion",JWT.verifyTokenMiddleware(),ExamController.userAddWrongQuestion)//用户将错题加入错题本
ExamRouter.post("/uniappAPI/exam/userdelete/wrongquestion",JWT.verifyTokenMiddleware(),ExamController.userDeleteWrongQuestion)//用户将错题从错题本删除
ExamRouter.post("/uniappAPI/exam/useradd/favoritequestion",JWT.verifyTokenMiddleware(),ExamController.userAddFavoriteQuestion)//用户将题目加入收藏
ExamRouter.post("/uniappAPI/exam/userdelete/favoritequestion",JWT.verifyTokenMiddleware(),ExamController.userDeleteFavoriteQuestion)//用户将题目从收藏删除
ExamRouter.get("/uniappAPI/exam/getUserFavoriteQuestionList",JWT.verifyTokenMiddleware(),ExamController.getUserFavoriteQuestionList)//获取用户的收藏题目
ExamRouter.post("/uniappAPI/exam/checkFavoriteQuestion",JWT.verifyTokenMiddleware(),ExamController.checkFavoriteQuestion)//检查题目是否已收藏
ExamRouter.post("/uniappAPI/exam/userpractice/question",JWT.verifyTokenMiddleware(),ExamController.userPracticeFavoriteQuestion)//用户点击题目进行练习(收藏与错题本)
ExamRouter.get("/uniappAPI/exam/getUserWrongQuestionList",JWT.verifyTokenMiddleware(),ExamController.getUserWrongQuestionList)//获取用户的错题列表
ExamRouter.post("/uniappAPI/exam/getexamsubjectmaterials",ExamController.getExamSubjectMaterials)//获取考试科目对应的网盘资源列表
ExamRouter.post("/uniappAPI/exam/getexamsubjecttitleurl",JWT.verifyTokenMiddleware(),ExamController.getExamSubjectTitleUrl)//获取考试科目对应的网盘资源url
ExamRouter.post("/uniappAPI/exam/checkexamverify",JWT.verifyTokenMiddleware(),ExamController.checkExamVerify)//检查考试是否已认证


module.exports = ExamRouter;