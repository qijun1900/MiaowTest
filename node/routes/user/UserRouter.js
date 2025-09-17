var express = require('express');
const UserController = require('../../controllers/user/UserController');
const JWT = require('../../MiddleWares/jwt');// 引入JWT中间件，用于验证token
var UserRouter = express.Router();

UserRouter.post("/uniappAPI/User/Userlogin", UserController.Userlogin)//登录接口
UserRouter.post("/uniappAPI/User/updateUserInfo", JWT.verifyTokenMiddleware(), UserController.updateUserInfo)//用户更新信息接口(新)
UserRouter.post("/uniappAPI/UserFavorite/addExamFavorite", JWT.verifyTokenMiddleware(),UserController.addExamFavorite)//用户收藏考试接口



module.exports = UserRouter;
