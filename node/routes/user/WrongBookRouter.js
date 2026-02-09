var express = require('express');
const WrongBookController = require('../../controllers/user/WrongBookController');
const JWT = require('../../MiddleWares/jwt');
var WrongBookRouter = express.Router();

// 获取错题本列表
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongBooks", JWT.verifyTokenMiddleware(), WrongBookController.getWrongBooks)
//创建错题本
WrongBookRouter.post("/uniappAPI/tools/wrongbook/createWrongBook", JWT.verifyTokenMiddleware(), WrongBookController.createWrongBook)
// 添加错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/addWrongQuestion", JWT.verifyTokenMiddleware(), WrongBookController.addWrongQuestion)
// 删除错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/deleteWrongQuestion", JWT.verifyTokenMiddleware(), WrongBookController.deleteWrongQuestion)
// 获取错题详情
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongQuestionDetail/:id", JWT.verifyTokenMiddleware(), WrongBookController.getWrongQuestionDetail)
// 更新错题
WrongBookRouter.post("/uniappAPI/tools/wrongbook/updateWrongQuestion", JWT.verifyTokenMiddleware(), WrongBookController.updateWrongQuestion)
// 获取错题统计
WrongBookRouter.get("/uniappAPI/tools/wrongbook/getWrongBookStatistics", JWT.verifyTokenMiddleware(), WrongBookController.getWrongBookStatistics)

module.exports = WrongBookRouter;