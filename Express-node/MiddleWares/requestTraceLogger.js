const crypto = require("crypto");
const LogService = require("../services/user/LogService");

// 生成服务端 traceId；若客户端传入 X-Trace-Id 则复用客户端值。
function generateTraceId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

const requestTraceLogger = (req, res, next) => {
  const incomingTraceId = req.headers["x-trace-id"];
  const traceId =
    typeof incomingTraceId === "string" && incomingTraceId.trim()
      ? incomingTraceId.trim().slice(0, 80)
      : generateTraceId();

  req.traceId = traceId;
  res.setHeader("X-Trace-Id", traceId);

  const start = Date.now();

  // 请求结束后异步落库，避免阻塞主业务响应。
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    setImmediate(() => {
      LogService.captureApiRequest(req, {
        statusCode: res.statusCode,
        durationMs,
      }).catch((error) => {
        console.error("[requestTraceLogger] 请求日志写入失败:", error.message);
      });
    });
  });

  next();
};

module.exports = requestTraceLogger;
