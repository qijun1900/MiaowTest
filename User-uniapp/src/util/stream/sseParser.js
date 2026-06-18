/**
 * SSE (Server-Sent Events) 解析工具
 */

export function parseSSEBuffer(buffer, emit, flush = false) {
    const frames = buffer.split(/\r?\n\r?\n/);
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
            // ignore incomplete frame
        }
    }

    return rest;
}

export function decodeChunk(chunk) {
    if (typeof chunk === "string") return chunk;

    if (chunk instanceof ArrayBuffer) {
        if (typeof TextDecoder !== "undefined") {
            return new TextDecoder("utf-8").decode(new Uint8Array(chunk));
        }
        const bytes = new Uint8Array(chunk);
        let text = "";
        for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
        try { return decodeURIComponent(escape(text)); } catch { return text; }
    }

    return "";
}
