var express = require('express');
const ExamController = require('../../controllers/admin/ExamController');
var ExamRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/examcoveruploads/' })


ExamRouter.post('/adminapi/exam/add',upload.single('file'),ExamController.add)//添加
ExamRouter.get('/adminapi/exam/list',ExamController.getexamList)//获取多个考试
ExamRouter.get('/adminapi/exam/list/:id',ExamController.getexamList)//获取单个考试
ExamRouter.post("/adminapi/exam/update",upload.single('file'),ExamController.updateInfo)//更新
ExamRouter.delete("/adminapi/exam/list/:id",ExamController.deleteInfo)//删除
ExamRouter.post("/adminapi/exam/selectquestion",ExamController.AddSelectQuestion)//添加选择题
ExamRouter.post("/adminapi/exam/blankquestion",ExamController.AddBlankQuestion)//添加填空题
ExamRouter.post("/adminapi/exam/judgequestion",ExamController.AddJudgeQuestion)//添加判断题
ExamRouter.post("/adminapi/exam/shortquestion",ExamController.AddShortQuestionList)//添加简答题
ExamRouter.get("/adminapi/exam/questionlist/:id",ExamController.getQuestionList)//获取不同类型的所有题目列表
ExamRouter.post("/adminapi/exam/updatePublish",ExamController.UpdateOneQuestion)//更新单条发布状态
ExamRouter.post("/adminapi/exam/batchPublish",ExamController.UpdateBatchQuestion)//更新多条发布状态
ExamRouter.delete("/adminapi/exam/deletequestion/:id",ExamController.DeleteQuestion)//删除题目
ExamRouter.get("/adminapi/exam/whichOneQuestion/:id",ExamController.getQuestionInfo)//获取单一题目详细信息
ExamRouter.post("/adminapi/exam/selectquestionUpdate/:id",ExamController.UpdateSelectQuestion)//更新单条选择题
ExamRouter.post("/adminapi/exam/blankquestionUpdate/:id",ExamController.UpdateBlankQuestion)//更新单条填空题
ExamRouter.post("/adminapi/exam/judgequestionUpdate/:id",ExamController.UpdateJudgeQuestion)//更新单条判断题
ExamRouter.post("/adminapi/exam/shortquestionUpdate/:id",ExamController.UpdateShortQuestionList)//更新单条简答题
ExamRouter.post("/adminapi/exam/updateExamStatus",ExamController.UpdateExamStatus)//更新考试状态
ExamRouter.post("/adminapi/exam/AddUserExamInfo",ExamController.AddUserExamInfo)//用户端的考试信息
ExamRouter.post("/adminapi/exam/UpdateUserExamInfo",ExamController.UpdateUserExamInfo)//更新用户端的考试信息，不再是新增
ExamRouter.get("/adminapi/exam/getUserExamInfo/:id",ExamController.getUserExamInfo)//获取用户端的考试信息
ExamRouter.post("/adminapi/exam/updateQuestionTitleStatus",ExamController.updateQuestionTitleStatus)//更新题目标题状态
ExamRouter.post("/adminapi/exam/deleteQuestionTitle",ExamController.deleteQuestionTitle)//删除题目标题
ExamRouter.post("/adminapi/exam/AddSingUserList",ExamController.AddSingUserList)//更新单条用户题目添加状态
ExamRouter.post("/adminapi/exam/RemoveSingUserList",ExamController.RemoveSingUserList)//更新单条用户题目删除状态
ExamRouter.post("/adminapi/exam/batchPublishedUserQuestionsList",ExamController.batchPublishedUserQuestionsList)//批量发布用户端的题目
ExamRouter.get("/adminapi/exam/publishedUserQuestionsList/:id",ExamController.getUserQuestionsList)//获取用户端已发布的题目
ExamRouter.post("/adminapi/exam/UserquestionlistDown/:id",ExamController.UserquestionlistDown)//不同类型题目用户端的题目全部下架操作


module.exports = ExamRouter; 