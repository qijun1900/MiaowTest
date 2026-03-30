const LogService = require("../../services/user/LogService");

const LogController = {
  // 批量接收前端埋点事件。
  reportActions: async (req, res) => {
    try {
      const events = Array.isArray(req.body?.events) ? req.body.events : [];
      const result = await LogService.reportActions(req, events);

      res.status(200).send({
        code: 200,
        ActionType: "OK",
        message: "行为日志上报成功",
        data: result,
      });
    } catch (error) {
      console.error("reportActions 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "行为日志上报失败",
      });
    }
  },

  // 接收前端异常信息（如 JS 异常、Promise 未捕获异常）。
  reportError: async (req, res) => {
    try {
      await LogService.reportFrontendError(req, req.body || {});

      res.status(200).send({
        code: 200,
        ActionType: "OK",
        message: "错误日志上报成功",
      });
    } catch (error) {
      console.error("reportError 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "错误日志上报失败",
      });
    }
  },
};

module.exports = LogController;
