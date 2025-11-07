var express = require('express');
const ExamController = require('../../controllers/admin/ExamController');
var ExamRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/examcoveruploads/' })


ExamRouter.post('/adminapi/exam/add',upload.single('file'),ExamController.ExamAdd)//添加考试科目
ExamRouter.get('/adminapi/exam/list',ExamController.getexamList)//获取多个考试科目
ExamRouter.post("/adminapi/exam/update",upload.single('file'),ExamController.updateInfo)//更新考试科目信息
ExamRouter.post('/adminapi/exam/updateExamStatus',ExamController.updateExamStatus)//更新考试科目状态
ExamRouter.post("/adminapi/exam/deloneExam",ExamController.deleteOneExamInfo)//删除单个考试科目信息
ExamRouter.post("/adminapi/exam/delmanyExam",ExamController.deleteManyExamInfo)//删除多个考试科目信息
ExamRouter.get("/adminapi/exam/get/questionList",ExamController.getSelectQuestionList)//获取不同类型的题目列表
ExamRouter.post("/adminapi/exam/add/selectquestion",ExamController.AddSelectQuestion)//添加选择题
ExamRouter.post("/adminapi/exam/add/blankquestion",ExamController.AddBlankQuestion)//添加填空题
ExamRouter.post("/adminapi/exam/add/judgequestion",ExamController.AddJudgeQuestion)//添加判断题
ExamRouter.post("/adminapi/exam/add/shortquestion",ExamController.AddShortQuestionList)//添加简答题
ExamRouter.post("/adminapi/exam/update/PublishQuestionstate",ExamController.UpdateOneQuestion)//更新单条发布状态
ExamRouter.post("/adminapi/exam/update/ManyPublishQuestionstate",ExamController.UpdateBatchQuestion)//更新多条发布状态
ExamRouter.post("/adminapi/exam/question/deleteOneQuestion",ExamController.DeleteOneQuestion)//删除单个题目
ExamRouter.post("/adminapi/exam/question/deleteManyQuestion",ExamController.DeleteManyQuestion)//删除多个题目
ExamRouter.get("/adminapi/exam/whichOneQuestion/:id",ExamController.getQuestionInfo)//获取单一题目详细信息
ExamRouter.post("/adminapi/exam/update/selectquestion",ExamController.UpdateSelectQuestion)//更新单条选择题
ExamRouter.post("/adminapi/exam/update/blankquestion",ExamController.UpdateBlankQuestion)//更新单条填空题
ExamRouter.post("/adminapi/exam/update/judgequestion",ExamController.UpdateJudgeQuestion)//更新单条判断题
ExamRouter.post("/adminapi/exam/update/shortquestion",ExamController.UpdateShortQuestionList)//更新单条简答题
ExamRouter.post("/adminapi/exam/updateExamStatus",ExamController.UpdateExamStatus)//更新考试状态
ExamRouter.post("/adminapi/questionTitle/addQuestionTitle",ExamController.AddquestionTitle)//增加题型
ExamRouter.get("/adminapi/questionTitle/getQuestionTitleList",ExamController.getQuestionTitle)//获取用户端的考试题型列表
ExamRouter.post("/adminapi/questionTitle/updateQuestionTitle",ExamController.UpdateQuestionTitle)//更新用户端的考试题型信息
ExamRouter.post("/adminapi/questionTitle/checkQuestionTitle",ExamController.CheckQuestionTitle)//检查用户端的考试题型是否还有题目
ExamRouter.post("/adminapi/questionTitle/deleteOneQuestionTitle",ExamController.DeleteOneQuestionTitle)//删除用户端的单个考试题型信息
ExamRouter.post('/adminapi/questionTitle/deleteManyQuestionTitle',ExamController.DeleteManyQuestionTitle)//删除用户端的多个考试题型信息
ExamRouter.post("/adminapi/questionTitle/updateQuestionOneTitleState",ExamController.UpdateOneQuestionTitleState)//更新单条考试题型目状态
ExamRouter.get("/adminapi/foruser/get/addQusetionList",ExamController.getAddQusetionList)//获取要添加题目列表
ExamRouter.post("/adminapi/foruser/addone/Addquestion",ExamController.AddOneQuestion)//向该题型下添加单条题目
ExamRouter.post("/adminapi/foruser/addmany/Addquestion",ExamController.AddManyQuestion)//向该题型下添加多条题目
ExamRouter.get("/adminapi/foruser/get/checkQusetionList",ExamController.getCheckQusetionList)//获取已添加题目列表ID
ExamRouter.post("/adminapi/foruser/get/matchQusetionList",ExamController.MatchQusetionList)//根据_id和category匹配题目获取题目信息
ExamRouter.post("/adminapi/foruser/post/RemoveUsersQuestionList",ExamController.RemoveUserQuestionList)//删除该题型下的题目ids
ExamRouter.post("/adminapi/exam/batchPublishedUserQuestionsList",ExamController.batchPublishedUserQuestionsList)//批量发布用户端的题目
ExamRouter.get("/adminapi/exam/publishedUserQuestionsList/:id",ExamController.getUserQuestionsList)//获取用户端已发布的题目
ExamRouter.post("/adminapi/exam/UserquestionlistDown/:id",ExamController.UserquestionlistDown)//不同类型题目用户端的题目全部下架操作

// ==============网盘资料管理相关API ========== //
ExamRouter.post("/adminapi/netDisk/addNetDisk",ExamController.AddNetDisk)//添加网盘资料

module.exports = ExamRouter; 