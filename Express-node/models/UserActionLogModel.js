const mongoose = require("mongoose");

// 用户行为日志：承载前端埋点事件，面向运营分析与行为回放。
const ACTION_LOG_RETENTION_DAYS = 90;

const UserActionLogSchema = new mongoose.Schema(
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
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      default: "general",
    },
    bizId: {
      type: String,
      default: "",
      index: true,
    },
    result: {
      type: String,
      enum: ["success", "fail", "unknown"],
      default: "unknown",
      index: true,
    },
    errorCode: {
      type: String,
      default: "",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    actionAt: {
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
        new Date(Date.now() + ACTION_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      index: {
        expires: 0,
      },
    },
  },
  {
    versionKey: false,
    collection: "user_action_logs",
  },
);

UserActionLogSchema.index({ uid: 1, actionAt: -1 });
UserActionLogSchema.index({ eventName: 1, actionAt: -1 });
// expireAt 字段已配置 TTL 索引，到期自动清理。

const UserActionLogModel = mongoose.model("user_action_log", UserActionLogSchema);

module.exports = UserActionLogModel;
