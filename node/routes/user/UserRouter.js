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
UserRouter.post("/uniappAPI/Feedback/submitFeedback", JWT.optionalTokenMiddleware(), UserController.userFeedback)//用户提交反馈接口(wx) - 使用可选JWT中间件




module.exports = UserRouter;
