import escconfig from "../../config/esc.config";

export const PLATFORM = {
    H5: "web",
    MP_WEIXIN: "mp-weixin",
};

export function detectPlatform() {
    try {
        return uni.getAppBaseInfo?.()?.uniPlatform || "";
    } catch {
        return "";
    }
}

export function isH5() {
    return detectPlatform() === PLATFORM.H5;
}

export function isMpWeixin() {
    return detectPlatform() === PLATFORM.MP_WEIXIN;
}

const baseURL = escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

export const wsBaseURL = baseURL.replace(/^http/, "ws");

export function buildURL(url) {
    return url.startsWith("http") ? url : `${baseURL}${url}`;
}

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
