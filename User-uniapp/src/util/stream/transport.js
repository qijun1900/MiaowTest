/**
 * 流式传输层：根据运行平台自动选择 SSE / WebSocket 传输方式。
 */

import { buildURL, buildHeaders, wsBaseURL, isH5, isMpWeixin } from "./platform";
import { parseSSEBuffer, decodeChunk } from "./sseParser";

export function streamRequest({ url, data, callbacks }) {
    const { onStart, onMessage, onDone, onError } = callbacks;

    let streamError = null;

    const emit = (event, payload) => {
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

    if (isH5()) return streamByFetch(url, data, emit, throwIfError);
    if (isMpWeixin()) return streamByUniRequest(url, data, emit, throwIfError);
    return streamByWebSocket(data, emit, throwIfError);
}

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
