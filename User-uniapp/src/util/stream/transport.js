/**
 * 流式传输层：根据运行平台自动选择 SSE / WebSocket 传输方式。
 *
 * 返回 { promise, abort } 句柄,允许调用方手动中止正在进行的流。
 */

import { buildURL, buildHeaders, wsBaseURL, isH5, isMpWeixin } from "./platform";
import { parseSSEBuffer, decodeChunk } from "./sseParser";

export function streamRequest({ url, data, callbacks }) {
    const { onStart, onMessage, onDone, onError } = callbacks;

    let streamError = null;
    // 用户主动 abort() 时置位;error 事件被吞掉,以便外层把停止当作正常结束处理
    const state = { aborted: false };

    const emit = (event, payload) => {
        // 已中止后,丢弃所有 start/message/error,避免残留 chunk 继续往气泡灌文字
        // done 也忽略 —— handleStopStream 已经把 UI 状态收尾过了,再走一次 onDone
        // 会多触发一次震动,且可能覆盖中止后用户开的新流程
        if (state.aborted) return;
        if (event === "start") onStart?.(payload);
        if (event === "message") onMessage?.(payload?.content || "");
        if (event === "done") onDone?.(payload);
        if (event === "error") {
            streamError = new Error(payload?.message || "流式请求失败");
            onError?.(payload);
        }
    };

    const throwIfError = () => {
        if (streamError) throw streamError;
    };

    if (isH5()) return streamByFetch(url, data, emit, throwIfError, state);
    if (isMpWeixin()) return streamByUniRequest(url, data, emit, throwIfError, state);
    return streamByWebSocket(data, emit, throwIfError, state);
}

// ─── H5：fetch + ReadableStream + AbortController ───────────────────────────
function streamByFetch(url, data, emit, throwIfError, state) {
    const fullURL = buildURL(url);
    const controller = new AbortController();

    const promise = fetch(fullURL, {
        method: "POST",
        headers: buildHeaders({ "source-client": "web", "platform": "h5" }),
        body: JSON.stringify(data),
        signal: controller.signal,
    }).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                buffer = parseSSEBuffer(buffer, emit);
            }
        } catch (err) {
            if (state.aborted || err?.name === "AbortError") {
                parseSSEBuffer(buffer, emit, true);
                return;
            }
            throw err;
        }

        parseSSEBuffer(buffer, emit, true);
        throwIfError();
    }).catch((err) => {
        if (state.aborted || err?.name === "AbortError") return;
        throw err;
    });

    return {
        promise,
        abort() {
            state.aborted = true;
            try { controller.abort(); } catch {}
        },
    };
}

// ─── 微信小程序：uni.request enableChunked + requestTask.abort() ────────────
function streamByUniRequest(url, data, emit, throwIfError, state) {
    const fullURL = buildURL(url);
    let requestTask = null;

    const promise = new Promise((resolve, reject) => {
        let buffer = "";

        requestTask = uni.request({
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
                // 用户主动 abort 触发 fail({errMsg:"request:fail abort"}),视作正常停止
                if (state.aborted || /abort/i.test(error?.errMsg || "")) {
                    parseSSEBuffer(buffer, emit, true);
                    resolve();
                    return;
                }
                emit("error", { message: error?.errMsg || "流式请求失败" });
                reject(error);
            },
        });

        requestTask?.onChunkReceived?.((res) => {
            buffer += decodeChunk(res.data);
            buffer = parseSSEBuffer(buffer, emit);
        });
    });

    return {
        promise,
        abort() {
            state.aborted = true;
            try { requestTask?.abort?.(); } catch {}
        },
    };
}

// ─── APP 端：WebSocket + 服务端 stop 协议 ──────────────────────────────────
function streamByWebSocket(data, emit, throwIfError, state) {
    const token = uni.getStorageSync("token") || "";
    const wsURL = `${wsBaseURL}/ws/llm/agent/chat/stream?token=${encodeURIComponent(token)}`;

    let socketTask = null;
    let forceCloseTimer = null;

    const promise = new Promise((resolve, reject) => {
        let settled = false;
        const settle = (fn) => { if (!settled) { settled = true; fn(); } };

        socketTask = uni.connectSocket({ url: wsURL, complete() {} });

        socketTask.onOpen(() => {
            socketTask.send({ data: JSON.stringify({ type: "chat", ...data }) });
        });

        socketTask.onMessage((res) => {
            let parsed;
            try { parsed = JSON.parse(res.data); } catch { return; }

            const { event, data: payload } = parsed;

            if (event === "start") emit("start", payload);
            if (event === "message") emit("message", payload);
            if (event === "done") {
                emit("done", payload);
                settle(() => { try { throwIfError(); resolve(); } catch (e) { reject(e); } });
                socketTask.close({});
            }
            if (event === "error") {
                emit("error", payload);
                if (state.aborted) {
                    settle(() => resolve());
                } else {
                    settle(() => reject(new Error(payload?.message || "流式请求失败")));
                }
                socketTask.close({});
            }
        });

        socketTask.onClose(() => {
            if (forceCloseTimer) { clearTimeout(forceCloseTimer); forceCloseTimer = null; }
            if (state.aborted) {
                settle(() => resolve());
                return;
            }
            settle(() => { try { throwIfError(); resolve(); } catch (e) { reject(e); } });
        });

        socketTask.onError(() => {
            if (state.aborted) {
                settle(() => resolve());
                return;
            }
            emit("error", { message: "WebSocket连接失败" });
            settle(() => reject(new Error("WebSocket连接失败")));
        });
    });

    return {
        promise,
        abort() {
            state.aborted = true;
            try {
                // 通知服务端停止生成,等待 done 后 onClose 自然 resolve
                socketTask?.send?.({ data: JSON.stringify({ type: "stop" }) });
            } catch {}
            // 2s 兜底:服务端无响应则强制关闭
            forceCloseTimer = setTimeout(() => {
                try { socketTask?.close?.({}); } catch {}
            }, 2000);
        },
    };
}
