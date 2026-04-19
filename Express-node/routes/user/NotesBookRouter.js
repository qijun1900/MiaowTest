var express = require("express");
const NotesBookController = require("../../controllers/user/NotesBookController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var NotesBookRouter = express.Router();

//获取笔记本列表
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebooks,
);
//获取笔记本详情
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookDetail,
);
//创建笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/createNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.createNotebook,
);
//更新笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/updateNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.updateNotebook,
);
//删除笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/deleteNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.deleteNotebook,
);
//获取笔记本内的笔记列表
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookNotes",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookNotes,
);
//获取笔记本内的笔记详情
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookNoteDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookNoteDetail,
);
//保存笔记本内的笔记（新增或更新）
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/saveNotebookNote",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.saveNotebookNote,
);
//切换笔记置顶状态
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/toggleNotebookNotePin",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.toggleNotebookNotePin,
);
//删除笔记本内的笔记
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/deleteNotebookNote",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.deleteNotebookNote,
);

module.exports = NotesBookRouter;
