const mongoose = require("mongoose");
const ApiRequestLogModel = require("../../models/ApiRequestLogModel");
const UserActionLogModel = require("../../models/UserActionLogModel");
const AppErrorLogModel = require("../../models/AppErrorLogModel");

// 单次批量上报的最大事件数，防止异常请求导致单次写入过大。
const MAX_ACTION_BATCH_SIZE = 50;

// 常见敏感字段，统一在日志层做脱敏处理。
const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "authorization",
  "verifycode",
  "code",
  "session_key",
  "openid",
  "email",
]);

function toSafeString(value, maxLength = 120) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

// 将 uid 安全转换为 ObjectId，非法值返回 null 避免写库报错。
function toObjectIdOrNull(value) {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
}

function sanitizePayload(payload, depth = 0) {
  // 对对象进行有限深度与长度的递归裁剪，防止日志膨胀。
  if (payload === null || payload === undefined) return payload;
  if (depth > 3) return "[TruncatedDepth]";

  if (Array.isArray(payload)) {
    return payload.slice(0, 20).map((item) => sanitizePayload(item, depth + 1));
  }

  if (typeof payload !== "object") {
    if (typeof payload === "string") return payload.slice(0, 500);
    return payload;
  }

  const output = {};
  const entries = Object.entries(payload).slice(0, 50);

  for (const [key, value] of entries) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      output[key] = "[REDACTED]";
      continue;
    }
    output[key] = sanitizePayload(value, depth + 1);
  }

  return output;
}

function shouldSkipApiLog(req) {
  // 仅记录 uniapp API 请求，并跳过日志上报接口本身，避免递归写日志。
  if (!req || !req.originalUrl) return true;
  if (req.method === "OPTIONS") return true;
  if (!req.originalUrl.startsWith("/uniappAPI/")) return true;
  if (req.originalUrl.startsWith("/uniappAPI/Log/")) return true;
  return false;
}

function getClientContext(req) {
  return {
    sourceClient: req?.clientInfo?.sourceClient || req?.headers?.["source-client"] || "unknown",
    platform: req?.clientInfo?.platform || req?.headers?.platform || "unknown",
  };
}

const LogService = {
  async captureApiRequest(req, { statusCode, durationMs }) {
    try {
      if (shouldSkipApiLog(req)) return;

      const uid = req?.user?.uid || null;
      const { sourceClient, platform } = getClientContext(req);

      await ApiRequestLogModel.create({ //路由日志记录，包含请求基本信息和上下文，便于后续分析和排查问题。
        traceId: toSafeString(req.traceId, 80),
        uid: toObjectIdOrNull(uid),
        sourceClient,
        platform,
        method: toSafeString(req.method, 10),
        route: toSafeString(req.path || req.originalUrl, 200),
        originalUrl: toSafeString(req.originalUrl, 500),
        statusCode,
        durationMs,
        ip: toSafeString(req.ip, 80),
        userAgent: toSafeString(req.headers["user-agent"], 300),
        requestBody: sanitizePayload(req.body),
        query: sanitizePayload(req.query),
        params: sanitizePayload(req.params),
      });
    } catch (error) {
      console.error("[LogService.captureApiRequest] 记录失败:", error.message);
    }
  },

  async reportActions(req, events) {
    // 行为日志支持批量上报，单次裁剪到 MAX_ACTION_BATCH_SIZE。
    if (!Array.isArray(events) || events.length === 0) {
      return { accepted: 0, inserted: 0 };
    }

    const uid = req?.user?.uid || null;
    const { sourceClient, platform } = getClientContext(req);
    const traceId = toSafeString(req.traceId, 80);

    const actionDocs = events //用户端上报的行为事件，经过安全裁剪和结构化后批量写入数据库。
      .slice(0, MAX_ACTION_BATCH_SIZE)
      .map((event) => {
        const eventName = toSafeString(event.eventName, 80);
        if (!eventName) return null;

        const rawResult = toSafeString(event.result || "unknown", 20).toLowerCase();
        const result = ["success", "fail", "unknown"].includes(rawResult)
          ? rawResult
          : "unknown";

        const actionAt = event.clientTime ? new Date(event.clientTime) : new Date();

        return {
          traceId,
          uid: toObjectIdOrNull(uid),
          sourceClient,
          platform,
          eventName,
          module: toSafeString(event.module || "general", 50),
          bizId: toSafeString(event.bizId || "", 120),
          result,
          errorCode: toSafeString(event.errorCode || "", 50),
          errorMessage: toSafeString(event.errorMessage || "", 500),
          metadata: sanitizePayload(event.metadata),
          actionAt: Number.isNaN(actionAt.getTime()) ? new Date() : actionAt,
        };
      })
      .filter(Boolean);

    if (actionDocs.length === 0) {
      return { accepted: 0, inserted: 0 };
    }

    // ordered:false 允许局部脏数据失败但不影响其余日志落库。
    const inserted = await UserActionLogModel.insertMany(actionDocs, {
      ordered: false,
    });

    return {
      accepted: events.length,
      inserted: inserted.length,
    };
  },

  async reportFrontendError(req, payload) {
    // 前端主动上报的异常，按统一结构持久化。
    const uid = req?.user?.uid || null;
    const { sourceClient, platform } = getClientContext(req);

    await AppErrorLogModel.create({
      traceId: toSafeString(req.traceId, 80),
      uid: toObjectIdOrNull(uid),
      sourceClient,
      platform,
      route: toSafeString(payload.route || req.originalUrl || "", 200),
      method: toSafeString(payload.method || req.method || "", 20),
      statusCode: Number(payload.statusCode) || 500,
      errorName: toSafeString(payload.errorName || "FrontendError", 80),
      errorMessage: toSafeString(payload.message || "Unknown frontend error", 1000),
      errorStack: toSafeString(payload.stack || "", 3000),
      requestBody: sanitizePayload(payload.extra || null),
      query: sanitizePayload(req.query),
      params: sanitizePayload(req.params),
      ip: toSafeString(req.ip, 80),
      userAgent: toSafeString(req.headers["user-agent"], 300),
    });
  },

  async captureAppError(err, req, statusCode = 500) {
    try {
      // 仅捕获用户端 API 异常，避免后台管理接口与脚本噪音。
      if (!req || !req.originalUrl || !req.originalUrl.startsWith("/uniappAPI/")) {
        return;
      }

      const uid = req?.user?.uid || null;
      const { sourceClient, platform } = getClientContext(req);

      await AppErrorLogModel.create({
        traceId: toSafeString(req.traceId, 80),
        uid: toObjectIdOrNull(uid),
        sourceClient,
        platform,
        route: toSafeString(req.path || req.originalUrl, 200),
        method: toSafeString(req.method, 20),
        statusCode,
        errorName: toSafeString(err?.name || "Error", 80),
        errorMessage: toSafeString(err?.message || "Unknown server error", 1000),
        errorStack: toSafeString(err?.stack || "", 3000),
        requestBody: sanitizePayload(req.body),
        query: sanitizePayload(req.query),
        params: sanitizePayload(req.params),
        ip: toSafeString(req.ip, 80),
        userAgent: toSafeString(req.headers["user-agent"], 300),
      });
    } catch (error) {
      console.error("[LogService.captureAppError] 记录失败:", error.message);
    }
  },
};

module.exports = LogService;
