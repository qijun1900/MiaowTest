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

NotesBookRouter.post(
  "/uniappAPI/tools/notebook/createNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.createNotebook,
);

module.exports = NotesBookRouter;