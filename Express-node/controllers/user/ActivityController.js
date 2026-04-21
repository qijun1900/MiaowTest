const ActivityService = require("../../services/user/ActivityService");

const ActivityController = {
  // 手动记录用户活动。
  addUserActivity: async (req, res) => {
    try {
      const result = await ActivityService.addUserActivity(req, req.body || {});

      if (!result.success) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: result.message || "用户未登录",
        });
      }

      res.status(200).send({
        code: 200,
        ActionType: "OK",
        message: "活动记录成功",
        data: result,
      });
    } catch (error) {
      console.error("addUserActivity 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "活动记录失败",
      });
    }
  },

  // 获取活动热力图。
  getActivityHeatmap: async (req, res) => {
    try {
      const result = await ActivityService.getUserActivityHeatmap(
        req,
        req.query || {},
      );

      res.status(200).send({
        code: 200,
        ActionType: "OK",
        message: "获取热力图成功",
        data: result,
      });
    } catch (error) {
      console.error("getActivityHeatmap 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "获取热力图失败",
      });
    }
  },

  // 获取指定日期活动详情。
  getActivityByDate: async (req, res) => {
    try {
      const result = await ActivityService.getUserActivityByDate(
        req,
        req.query?.date,
      );

      res.status(200).send({
        code: 200,
        ActionType: "OK",
        message: "获取活动详情成功",
        data: result,
      });
    } catch (error) {
      console.error("getActivityByDate 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "获取活动详情失败",
      });
    }
  },
};

module.exports = ActivityController;
