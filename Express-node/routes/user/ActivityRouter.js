var express = require("express");
const ActivityController = require("../../controllers/user/ActivityController");
const JWT = require("../../MiddleWares/jwt");
var ActivityRouter = express.Router();

// 记录用户业务活动。
ActivityRouter.post(
  "/uniappAPI/Activity/addUserActivity",
  JWT.verifyTokenMiddleware(),
  ActivityController.addUserActivity,
);

// 获取用户活动热力图数据。
ActivityRouter.get(
  "/uniappAPI/Activity/getActivityHeatmap",
  JWT.verifyTokenMiddleware(),
  ActivityController.getActivityHeatmap,
);

// 获取指定日期的用户活动明细。
ActivityRouter.get(
  "/uniappAPI/Activity/getActivityByDate",
  JWT.verifyTokenMiddleware(),
  ActivityController.getActivityByDate,
);

module.exports = ActivityRouter;
