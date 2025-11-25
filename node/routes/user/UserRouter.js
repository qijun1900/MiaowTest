var express = require('express');
const UserController = require('../../controllers/user/UserController');
const JWT = require('../../MiddleWares/jwt');// 引入JWT中间件，用于验证token
var UserRouter = express.Router();

UserRouter.post("/uniappAPI/User/Userlogin", UserController.Userlogin)//微信登录接口
UserRouter.post("/uniappAPI/User/UserRegister", UserController.UserRegister)//用户注册接口
UserRouter.post("/uniappAPI/User/UserAccountLogin", UserController.UserAccountLogin)//用户账号登录接口
UserRouter.post("/uniappAPI/User/updateUserInfo", JWT.verifyTokenMiddleware(), UserController.updateUserInfo)//用户更新信息接口
UserRouter.post("/uniappAPI/UserFavorite/addExamFavorite", JWT.verifyTokenMiddleware(),UserController.addExamFavorite)//添加用户收藏考试接口
UserRouter.post("/uniappAPI/UserFavorite/getExamFavorites", JWT.verifyTokenMiddleware(),UserController.getExamFavorites)//检测是否收藏考试接口
UserRouter.post("/uniappAPI/UserFavorite/removeExamFavorite", JWT.verifyTokenMiddleware(),UserController.removeExamFavorite)//用户取消收藏考试接口
UserRouter.get("/uniappAPI/UserFavorite/getUserFavoritesExams", JWT.verifyTokenMiddleware(),UserController.getUserFavoritesExam)//用户获取收藏的考试接口
UserRouter.post("/uniappAPI/User/BindAccount", JWT.verifyTokenMiddleware(),UserController.BindAccount)//用户绑定账号接口(wx)
UserRouter.get("/uniappAPI/User/checkUserBind", JWT.verifyTokenMiddleware(),UserController.checkUserBind)//用户检测是否绑定账号接口(wx)
UserRouter.post("/uniappAPI/Feedback/submitFeedback", JWT.optionalTokenMiddleware(), UserController.userFeedback)//用户提交反馈接口
UserRouter.post("/uniappAPI/exam/savePracticeNote", JWT.verifyTokenMiddleware(), UserController.savePracticeNote)//用户保存练习笔记接口- 
UserRouter.post("/uniappAPI/exam/getPracticeNote", JWT.verifyTokenMiddleware(), UserController.getPracticeNote)//用户获取练习笔记接口-
UserRouter.get("/uniappAPI/UserNote/getNoteExamList", JWT.verifyTokenMiddleware(), UserController.getNoteExamList)//用户获取笔记科目列表接口-
UserRouter.post("/uniappAPI/UserNote/getNoteListByExamId", JWT.verifyTokenMiddleware(), UserController.getNoteListByExamId)//根据科目id用户获取笔记列表接口-
UserRouter.post("/uniappAPI/exam/saveUserBankPracticeNote", JWT.verifyTokenMiddleware(), UserController.saveUserBankPracticeNote)//用户保存自己题库题目练习笔记接口-
UserRouter.post("/uniappAPI/exam/getUserBankPracticeNote", JWT.verifyTokenMiddleware(), UserController.getUserBankPracticeNote)//用户获取自己题库题目练习笔记接口-

/************工具api*********** */
UserRouter.post("/uniappAPI/set/TodayTodos", JWT.verifyTokenMiddleware(), UserController.setTodayTodos)//设置今日待办事项接口-
UserRouter.get("/uniappAPI/get/dotDates", JWT.verifyTokenMiddleware(), UserController.getDotDates)//获取待办事项日期列表接口-用来显示圆点
UserRouter.post("/uniappAPI/get/TodayTodos", JWT.verifyTokenMiddleware(), UserController.getTodayTodos)//获取今日待办事项接口-
UserRouter.post("/uniappAPI/set/toggleTodoStatus", JWT.verifyTokenMiddleware(), UserController.toggleTodoStatus)//切换待办事项完成状态接口-
UserRouter.post("/uniappAPI/set/deleteTodo", JWT.verifyTokenMiddleware(), UserController.deleteTodo)//删除待办事项接口-
UserRouter.post("/uniappAPI/set/editTodo", JWT.verifyTokenMiddleware(), UserController.editTodo)//编辑待办事项接口-





//测试
UserRouter.post("/uniappAPI/llm/chat", UserController.useLLMChat)//单次对话

module.exports = UserRouter;
