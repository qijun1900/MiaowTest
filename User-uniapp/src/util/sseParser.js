/**
 * SSE (Server-Sent Events) 解析工具。
 *
 * SSE 帧格式：
 *   event: <事件名>\n
 *   data: <JSON 数据>\n
 *   \n
 *
 * 多行 data 通过换行拼接后整体 JSON.parse。
 */

/**
 * 解析 SSE 文本缓冲区，提取完整的 event/data 帧并通过 emit 回调分发。
 *
 * @param {string} buffer  - 累积的文本缓冲
 * @param {Function} emit  - 事件回调，签名为 (eventName: string, parsedData: any) => void
 * @param {boolean} flush  - 是否强制解析剩余内容（连接结束时传 true）
 * @returns {string} 未解析完的残余文本（等待下次追加后继续解析）
 */
export function parseSSEBuffer(buffer, emit, flush = false) {
    // SSE 帧以双换行分隔
    const frames = buffer.split(/\r?\n\r?\n/);
    // 非 flush 模式下，最后一段可能是不完整的帧，保留等待下次追加
    const rest = flush ? "" : frames.pop();

    for (const frame of frames) {
        let event = "message";
        const dataLines = [];

        for (const line of frame.split(/\r?\n/)) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }

        if (!dataLines.length) continue;

        try {
            emit(event, JSON.parse(dataLines.join("\n")));
        } catch {
            // 忽略无法解析的帧（可能是不完整的 JSON）
        }
    }

    return rest;
}

/**
 * 将 ArrayBuffer 或 string 类型的 chunk 解码为 UTF-8 字符串。
 * 兼容不同平台的二进制数据传输格式。
 *
 * @param {ArrayBuffer|string} chunk - 原始 chunk 数据
 * @returns {string} 解码后的文本
 */
export function decodeChunk(chunk) {
    if (typeof chunk === "string") return chunk;

    if (chunk instanceof ArrayBuffer) {
        if (typeof TextDecoder !== "undefined") {
            return new TextDecoder("utf-8").decode(new Uint8Array(chunk));
        }
        // 兼容无 TextDecoder 的环境
        const bytes = new Uint8Array(chunk);
        let text = "";
        for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
        try { return decodeURIComponent(escape(text)); } catch { return text; }
    }

    return "";
}
