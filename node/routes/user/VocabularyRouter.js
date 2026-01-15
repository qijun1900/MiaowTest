var express = require('express');
const VocabularyController = require('../../controllers/user/VocabularyController');
const JWT = require('../../MiddleWares/jwt');
var VocabularyRouter = express.Router();

//获取单词书列表
VocabularyRouter.get("/uniappAPI/tools/vocabulary/getWordBooks", JWT.verifyTokenMiddleware(),VocabularyController.getWordBooks)


module.exports = VocabularyRouter;