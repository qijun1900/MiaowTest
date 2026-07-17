const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const LLMService = require("../services/user/LLMService");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "MiaowTest_default_secret";

/** WebSocket 流式聊天的升级路径 */
const WS_PATH = "/ws/llm/agent/chat/stream";

/**
 * 从 WebSocket 握手请求的 URL query 中提取 JWT token。
 */
function extractToken(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.searchParams.get("token") || "";
}

/**
 * 验证 JWT 并返回 uid，失败返回 null。
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    return decoded.uid || decoded.id || decoded._id || null;
  } catch {
    return null;
  }
}

/**
 * 初始化 WebSocket 流式聊天服务。
 * 挂载到 HTTP server 的 upgrade 事件，仅处理指定路径的 WebSocket 连接。
 *
 * 协议：
 *   客户端 → 服务端：{ type: "chat", message, agentKey, conversationId }
 *   服务端 → 客户端：{ event: "start"|"message"|"done"|"error", data: {...} }
 *
 * @param {import('http').Server} server
 */
function setupStreamChatWS(server) {
  const wss = new WebSocketServer({ noServer: true });

  // 仅对指定路径执行 WebSocket 升级，其余路径拒绝
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === WS_PATH) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws, req) => {
    const token = extractToken(req);
    const uid = verifyToken(token);

    if (!uid) {
      ws.send(JSON.stringify({ event: "error", data: { message: "认证失败" } }));
      ws.close();
      return;
    }

    // 当前流的 AbortController,用于支持客户端发 type:"stop" 中止
    let currentAC = null;

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ event: "error", data: { message: "消息格式错误" } }));
        return;
      }

      if (msg.type === "stop") {
        if (currentAC) {
          console.log("[WS] 收到 stop, 中止当前流");
          currentAC.abort();
        }
        return;
      }

      if (msg.type !== "chat") return;

      const { message, agentKey, conversationId, images, files, enableThinking, scene } = msg;
      if ((!message && (!images || !images.length) && (!files || !files.length)) || !agentKey) {
        ws.send(JSON.stringify({ event: "error", data: { message: "缺少必要参数" } }));
        return;
      }

      // 向客户端发送事件，自动检查连接状态
      const sendEvent = (event, data) => {
        if (event === "message") {
          const content = data?.content || "";
          if (!content) {
            console.warn("[WS] empty token chunk");
          } else {
            console.log(`[WS] >>> message (${content.length} chars)`);
          }
        } else {
          console.log(`[WS] >>> ${event}`, JSON.stringify(data).substring(0, 80));
        }
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ event, data }));
        }
      };

      currentAC = new AbortController();
      try {
        await LLMService.ChatWithAgentAndSaveStream({
          uid,
          message,
          agentKey,
          conversationId,
          images,
          files,
          enableThinking,
          scene,
          onStart: (payload) => sendEvent("start", payload),
          onToken: (content) => sendEvent("message", { content }),
          onReasoning: (content) => sendEvent("reasoning", { content }),
          signal: currentAC.signal,
        });
        sendEvent("done", { done: true, aborted: currentAC.signal.aborted });
      } catch (error) {
        console.error("[WS] 流式处理错误:", error.message);
        sendEvent("error", { message: error.message || "流式处理失败" });
      } finally {
        currentAC = null;
      }
    });

    ws.on("close", () => {
      if (currentAC) currentAC.abort();
    });

    ws.on("error", (err) => {
      console.error("[WS] 连接错误:", err.message);
      if (currentAC) currentAC.abort();
    });
  });

  console.log(`[WS] 流式聊天服务已初始化: ${WS_PATH}`);
}

module.exports = { setupStreamChatWS };
