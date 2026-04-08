var express = require("express");
const NotesBookController = require("../../controllers/user/NotesBookController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var NotesBookRouter = express.Router();

NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebooks,
);

NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookDetail,
);

NotesBookRouter.post(
  "/uniappAPI/tools/notebook/createNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.createNotebook,
);

NotesBookRouter.post(
  "/uniappAPI/tools/notebook/updateNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.updateNotebook,
);

NotesBookRouter.post(
  "/uniappAPI/tools/notebook/deleteNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.deleteNotebook,
);

module.exports = NotesBookRouter;
