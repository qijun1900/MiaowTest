const mongoose = require("mongoose");

// 用户日活热力聚合：用于贡献热力图按天展示。
const UserActivityDailySchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consumer",
      required: true,
      index: true,
    },
    activityDate: {
      type: String,
      required: true,
      index: true,
    }, // YYYY-MM-DD（按北京时间归档）
    // 对应日期的零点时间，用于范围查询和排序。
    activityDateAt: {
      type: Date,
      required: true,
      index: true,
    },
    // 当天累计热度分值，热力图颜色层次直接根据它计算。
    totalScore: {
      type: Number,
      default: 0,
    },
    // 这三个字段保留给历史兼容与排查用途，当前热力主要由业务动作累加。
    apiRequestCount: {
      type: Number,
      default: 0,
    },
    successRequestCount: {
      type: Number,
      default: 0,
    },
    failRequestCount: {
      type: Number,
      default: 0,
    },
    actionEventCount: {
      type: Number,
      default: 0,
    },
    manualEventCount: {
      type: Number,
      default: 0,
    },
    // 聚合记录更新时间，便于调试增量写入是否生效。
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    env: {
      type: String,
      default: process.env.NODE_ENV || "development",
    },
  },
  {
    versionKey: false,
    collection: "user_activity_daily",
  },
);

  // 同一用户同一天只能有一条聚合记录，写入时使用 upsert。
UserActivityDailySchema.index({ uid: 1, activityDate: 1 }, { unique: true });
UserActivityDailySchema.index({ uid: 1, activityDateAt: 1 });

const UserActivityDailyModel = mongoose.model(
  "user_activity_daily",
  UserActivityDailySchema,
);

module.exports = UserActivityDailyModel;
