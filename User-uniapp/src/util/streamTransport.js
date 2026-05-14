/**
 * 流式传输层：根据运行平台自动选择 SSE / WebSocket 传输方式。
 *
 * 三种传输策略：
 *   1. H5 (web)：fetch + ReadableStream — 浏览器原生流式读取
 *   2. 微信小程序 (mp-weixin)：uni.request + enableChunked + onChunkReceived
 *   3. APP 端 (其他)：uni.connectSocket WebSocket — 真正的双向流式通信
 *
 * 所有策略统一通过 StreamCallbacks 回调分发事件：
 *   - onStart(payload)    — 收到开始事件，payload 包含 conversationId
 *   - onMessage(content)  — 收到一个 token 片段
 *   - onDone(payload)     — 流式完成
 *   - onError(payload)    — 发生错误
 */

import { buildURL, buildHeaders, wsBaseURL, isH5, isMpWeixin } from "./platform";
import { parseSSEBuffer, decodeChunk } from "./sseParser";

/**
 * @typedef {Object} StreamCallbacks
 * @property {Function} onStart    - 流开始回调
 * @property {Function} onMessage  - 收到 token 回调
 * @property {Function} onDone     - 流完成回调
 * @property {Function} onError    - 错误回调
 */

/**
 * 统一的流式请求入口，自动选择平台最优传输方式。
 *
 * @param {Object} params
 * @param {string} params.url          - 请求路径（相对路径）
 * @param {Object} params.data         - 请求体数据
 * @param {StreamCallbacks} params.callbacks - 事件回调集合
 * @returns {Promise<void>}
 */
export function streamRequest({ url, data, callbacks }) {
    const { onStart, onMessage, onDone, onError } = callbacks;

    let streamError = null;

    /**
     * 统一事件分发器：将底层传输事件映射到用户回调。
     * error 事件会记录错误，供传输层在流结束时抛出以 reject Promise。
     */
    const emit = (event, payload) => {
        if (event === "start") onStart?.(payload);
        if (event === "message") onMessage?.(payload?.content || "");
        if (event === "done") onDone?.(payload);
        if (event === "error") {
            streamError = new Error(payload?.message || "流式请求失败");
            onError?.(payload);
        }
    };

    /**
     * 传输结束后检查是否有错误需要抛出。
     * 各传输策略在 resolve/reject 前调用此函数。
     */
    const throwIfError = () => {
        if (streamError) throw streamError;
    };

    if (isH5()) return streamByFetch(url, data, emit, throwIfError);
    if (isMpWeixin()) return streamByUniRequest(url, data, emit, throwIfError);
    return streamByWebSocket(data, emit, throwIfError);
}

// ─── H5：fetch + ReadableStream ──────────────────────────────────────────────

/**
 * H5 平台使用 fetch API 的 ReadableStream 实现流式读取。
 * 逐 chunk 解析 SSE 帧并回调。
 */
function streamByFetch(url, data, emit, throwIfError) {
    const fullURL = buildURL(url);

    return fetch(fullURL, {
        method: "POST",
        headers: buildHeaders({ "source-client": "web", "platform": "h5" }),
        body: JSON.stringify(data),
    }).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            buffer = parseSSEBuffer(buffer, emit);
        }

        parseSSEBuffer(buffer, emit, true);
        throwIfError();
    });
}

// ─── 微信小程序：uni.request + onChunkReceived ──────────────────────────────

/**
 * 微信小程序使用 uni.request 的 enableChunked 模式接收分块数据。
 */
function streamByUniRequest(url, data, emit, throwIfError) {
    const fullURL = buildURL(url);

    return new Promise((resolve, reject) => {
        let buffer = "";

        const requestTask = uni.request({
            url: fullURL,
            method: "POST",
            header: buildHeaders(),
            data,
            timeout: 120000,
            enableChunked: true,
            success() {
                parseSSEBuffer(buffer, emit, true);
                try { throwIfError(); resolve(); } catch (e) { reject(e); }
            },
            fail(error) {
                emit("error", { message: error?.errMsg || "流式请求失败" });
                reject(error);
            },
        });

        requestTask?.onChunkReceived?.((res) => {
            buffer += decodeChunk(res.data);
            buffer = parseSSEBuffer(buffer, emit);
        });
    });
}

// ─── APP 端：WebSocket ───────────────────────────────────────────────────────

/**
 * APP 端使用 WebSocket 实现真正的流式接收。
 * WebSocket 协议：客户端发送 { type: "chat", ... }，服务端推送 { event, data } 帧。
 */
function streamByWebSocket(data, emit, throwIfError) {
    const token = uni.getStorageSync("token") || "";
    const wsURL = `${wsBaseURL}/ws/llm/agent/chat/stream?token=${encodeURIComponent(token)}`;

    return new Promise((resolve, reject) => {
        let settled = false;
        const settle = (fn) => { if (!settled) { settled = true; fn(); } };

        const socketTask = uni.connectSocket({ url: wsURL, complete() {} });

        socketTask.onOpen(() => {
            socketTask.send({ data: JSON.stringify({ type: "chat", ...data }) });
        });

        let msgCount = 0;
        socketTask.onMessage((res) => {
            let parsed;
            try { parsed = JSON.parse(res.data); } catch { return; }

            const { event, data: payload } = parsed;
            // console.log(`[WS传输] onMessage #${++msgCount}: ${event}`, event === "message" ? `(len=${(payload?.content || "").length})` : "");

            if (event === "start") emit("start", payload);
            if (event === "message") emit("message", payload);
            if (event === "done") {
                emit("done", payload);
                settle(() => { try { throwIfError(); resolve(); } catch (e) { reject(e); } });
                socketTask.close({});
            }
            if (event === "error") {
                emit("error", payload);
                settle(() => reject(new Error(payload?.message || "流式请求失败")));
                socketTask.close({});
            }
        });

        socketTask.onClose(() => {
            settle(() => { try { throwIfError(); resolve(); } catch (e) { reject(e); } });
        });

        socketTask.onError(() => {
            emit("error", { message: "WebSocket连接失败" });
            settle(() => reject(new Error("WebSocket连接失败")));
        });
    });
}
