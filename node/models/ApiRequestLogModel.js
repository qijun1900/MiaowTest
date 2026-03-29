const mongoose = require("mongoose");

// 请求级日志：用于接口排障、接口耗时分析与链路追踪。
const REQUEST_LOG_RETENTION_DAYS = 15;// 请求日志保留时间较短，避免存储压力过大。

const ApiRequestLogSchema = new mongoose.Schema(
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
    method: String,
    route: {
      type: String,
      index: true,
    },
    originalUrl: String,
    statusCode: {
      type: Number,
      index: true,
    },
    durationMs: {
      type: Number,
      index: true,
    },
    ip: String,
    userAgent: String,
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
    requestAt: {
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
        new Date(
          Date.now() + REQUEST_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ),
      index: {
        expires: 0,
      },
    },
  },
  {
    versionKey: false,
    collection: "api_request_logs",
  },
);

ApiRequestLogSchema.index({ uid: 1, requestAt: -1 });
ApiRequestLogSchema.index({ route: 1, requestAt: -1 });
// TTL 索引位于 expireAt 字段，文档到期后由 MongoDB 自动清理。

const ApiRequestLogModel = mongoose.model("api_request_log", ApiRequestLogSchema);

module.exports = ApiRequestLogModel;
