const mongoose = require("mongoose");

// 异常日志：统一记录前端上报异常与服务端接口异常。
const ERROR_LOG_RETENTION_DAYS = 180;

const AppErrorLogSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      index: true,
    },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consumer",
      index: true,
    },
    sourceClient: {
      type: String,
      default: "unknown",
    },
    platform: {
      type: String,
      default: "unknown",
    },
    route: {
      type: String,
      default: "",
      index: true,
    },
    method: {
      type: String,
      default: "",
    },
    statusCode: {
      type: Number,
      default: 500,
      index: true,
    },
    errorName: {
      type: String,
      default: "Error",
    },
    errorMessage: {
      type: String,
      default: "",
      required: true,
    },
    errorStack: {
      type: String,
      default: "",
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    query: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    errorAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    env: {
      type: String,
      default: process.env.NODE_ENV || "development",
    },
    expireAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + ERROR_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      index: {
        expires: 0,
      },
    },
  },
  {
    versionKey: false,
    collection: "app_error_logs",
  },
);

AppErrorLogSchema.index({ uid: 1, errorAt: -1 });
AppErrorLogSchema.index({ route: 1, errorAt: -1 });
// 通过 expireAt 的 TTL 策略进行长期清理。

const AppErrorLogModel = mongoose.model("app_error_log", AppErrorLogSchema);

module.exports = AppErrorLogModel;
