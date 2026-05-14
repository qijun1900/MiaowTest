import escconfig from "../config/esc.config";

/**
 * 运行时平台检测工具。
 * 根据 uni-app 的 uniPlatform 判断当前运行环境，用于选择不同的网络请求策略。
 */

/** 平台常量 */
export const PLATFORM = {
    H5: "web",
    MP_WEIXIN: "mp-weixin",
};

/**
 * 获取当前运行平台标识。
 * @returns {string} "web" | "mp-weixin" | "app" | "app-plus" | ...
 */
export function detectPlatform() {
    try {
        return uni.getAppBaseInfo?.()?.uniPlatform || "";
    } catch {
        return "";
    }
}

/**
 * 判断当前是否为 H5 环境。
 */
export function isH5() {
    return detectPlatform() === PLATFORM.H5;
}

/**
 * 判断当前是否为微信小程序环境。
 */
export function isMpWeixin() {
    return detectPlatform() === PLATFORM.MP_WEIXIN;
}

// ─── URL 构建 ────────────────────────────────────────────────────────────────

const baseURL = escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

/** WebSocket 基础地址（将 http(s) 替换为 ws(s)） */
export const wsBaseURL = baseURL.replace(/^http/, "ws");

/**
 * 将相对路径拼接为完整 URL，已包含 http 前缀的路径原样返回。
 */
export function buildURL(url) {
    return url.startsWith("http") ? url : `${baseURL}${url}`;
}

/**
 * 构建通用请求头，包含认证 token、平台标识和客户端来源。
 * @param {Object} customHeader - 额外的自定义请求头
 */
export function buildHeaders(customHeader = {}) {
    const platform = isH5() ? "h5" : "miniapp";
    const token = uni.getStorageSync("token");
    return {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "source-client": isH5() ? "web" : "miniapp",
        platform,
        ...(escconfig.useCloudContainer ? { "X-WX-SERVICE": escconfig.cloudService } : {}),
        ...customHeader,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
