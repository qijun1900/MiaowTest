const mongoose = require("mongoose");

// 业务活动事件：只记录贡献热力相关的业务动作，不混入系统日志。
const ACTIVITY_EVENT_RETENTION_DAYS = 180;

const UserActivityEventSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      index: true,
    },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consumer",
      required: true,
      index: true,
    },
    // 请求来源信息只用于后续排查和统计，不参与热力值计算。
    sourceClient: {
      type: String,
      default: "unknown",
    },
    platform: {
      type: String,
      default: "unknown",
    },
    // 业务事件名，例如 NOTE_SAVED、WRONG_QUESTION_ADDED。
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    // 业务模块归类，便于按场景筛选与聚合。
    module: {
      type: String,
      default: "business",
      index: true,
    },
    // 业务主键，例如题库 ID、错题本 ID、反馈关联 ID。
    bizId: {
      type: String,
      default: "",
      index: true,
    },
    // 单次活动贡献的热度分值。
    score: {
      type: Number,
      default: 1,
    },
    // 记录事件附带的业务上下文，前端详情页会读取其中的描述信息。
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // 事件发生时间，热力图和日明细都按这个时间归档。
    activityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    env: {
      type: String,
      default: process.env.NODE_ENV || "development",
    },
  },
  {
    versionKey: false,
    collection: "user_activity_events",
  },
);

  // 常用查询：按用户看最近活动，按用户+事件名看场景明细。
UserActivityEventSchema.index({ uid: 1, activityAt: -1 });
UserActivityEventSchema.index({ uid: 1, eventName: 1, activityAt: -1 });

const UserActivityEventModel = mongoose.model(
  "user_activity_event",
  UserActivityEventSchema,
);

module.exports = UserActivityEventModel;
