var express = require('express');
const WrongBookController = require('../../controllers/user/WrongBookController');
const JWT = require('../../MiddleWares/jwt');
const requireUid = require('../../MiddleWares/requireUid');
var WrongBookRouter = express.Router();

// 获取错题本列表 
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongBooks", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.getWrongBooks)
// 获取错题本详情
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongBookDetail", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.getWrongBookDetail)
// 创建错题本
WrongBookRouter.post("/uniappAPI/tools/wrongbook/createWrongBook", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.createWrongBook)
// 更新错题本
WrongBookRouter.post("/uniappAPI/tools/wrongbook/updateWrongBook", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.updateWrongBook)
// 删除错题本
WrongBookRouter.post("/uniappAPI/tools/wrongbook/deleteWrongBook", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.deleteWrongBook)
//添加图片
WrongBookRouter.post("/uniappAPI/upload/image", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.uploadImage)
// 添加错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/addWrongQuestion", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.addWrongQuestion)
// 获取错题列表
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongQuestions", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.getWrongQuestions)
// 删除错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/deleteWrongQuestion", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.deleteWrongQuestion)
//标记为已掌握
WrongBookRouter.post("/uniappAPI/tools/wrongbook/markAsMastered", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.markAsMastered)
// 获取错题详情
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongQuestionDetail/:id", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.getWrongQuestionDetail)
// 更新错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/updateWrongQuestion", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.updateWrongQuestion)
// 获取错题统计
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongBookStatistics", JWT.verifyTokenMiddleware(), requireUid, WrongBookController.getWrongBookStatistics)


module.exports = WrongBookRouter;