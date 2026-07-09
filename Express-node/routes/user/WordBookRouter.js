var express = require("express");
const WordBookController = require("../../controllers/user/WordBookController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var WordBookRouter = express.Router();

// 获取单词本列表
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBooks,
);

// 获取单词本详情
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBookDetail,
);

// 创建单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/createWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.createWordBook,
);

// 更新单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/updateWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.updateWordBook,
);

// 删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/deleteWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.deleteWordBook,
);

// 批量删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/batchDeleteWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.batchDeleteWordBooks,
);

module.exports = WordBookRouter;
