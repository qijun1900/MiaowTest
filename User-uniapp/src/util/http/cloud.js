import escconfig from "../../config/esc.config";
import { getPlatform, getClientHeader } from "./platform";
import showModal from "../ui/modal";

const CLOUD_READY_CHECK_PATH = "/health";
const CLOUD_READY_CHECK_INTERVAL = 2000;
const CLOUD_READY_CHECK_TIMEOUT = 45000;

let cloudWakeupPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getCloudErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return String(error.message || error.errMsg || "");
}

export function getResponseErrorMessage(data) {
  if (!data || typeof data !== "object") return "";
  return String(data.message || data.msg || "");
}

function isCloudWakeupRelatedStatus(statusCode) {
  return [502, 503, 504].includes(Number(statusCode));
}

export function isCloudWakeupRelatedResponse(response) {
  if (!response) return false;
  if (isCloudWakeupRelatedStatus(response.statusCode)) return true;

  const message = getResponseErrorMessage(response.data).toLowerCase();
  if (!message) return false;

  return /(upstream|bad gateway|service unavailable|timeout|timed out|cold|starting)/.test(
    message,
  );
}

export function isCloudWakeupRelatedError(error) {
  const message = getCloudErrorMessage(error).toLowerCase();
  if (!message) return false;

  return /(timeout|timed out|econnreset|bad gateway|service unavailable|upstream|502|503|504|connect|disconnect|reset)/.test(
    message,
  );
}

export function isWechatCloudRuntime() {
  return (
    escconfig.useCloudContainer &&
    typeof wx !== "undefined" &&
    !!wx.cloud &&
    getPlatform() === "miniapp"
  );
}

export function buildCloudHeaders(customHeader = {}) {
  const platform = getPlatform();
  const clientHeader = getClientHeader();

  const headers = {
    ...customHeader,
    "source-client": clientHeader,
    platform: platform,
  };

  const token = uni.getStorageSync("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    "X-WX-SERVICE": escconfig.cloudService,
    ...headers,
  };
}

export function callCloudContainer(options) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error("请在微信小程序环境下使用云托管API"));
      return;
    }

    wx.cloud.callContainer({
      config: {
        env: escconfig.cloudEnv,
      },
      path: options.url,
      header: buildCloudHeaders(options.header),
      method: options.method || "GET",
      data: options.data || {},
      timeout: options.timeout || 15000,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });
}

async function probeCloudReady() {
  try {
    const res = await callCloudContainer({
      url: CLOUD_READY_CHECK_PATH,
      method: "GET",
      timeout: 5000,
      header: {
        "x-cloud-probe": "1",
      },
    });

    return (
      res.statusCode >= 200 &&
      res.statusCode < 300 &&
      (res?.data?.status === "ok" || res?.data?.database === "connected")
    );
  } catch {
    return false;
  }
}

async function waitForCloudReady() {
  const deadline = Date.now() + CLOUD_READY_CHECK_TIMEOUT;
  while (Date.now() < deadline) {
    const ready = await probeCloudReady();
    if (ready) return;
    await sleep(CLOUD_READY_CHECK_INTERVAL);
  }

  const timeoutError = new Error("服务启动时间较长，请稍后再试");
  timeoutError.code = "CLOUD_WAKEUP_TIMEOUT";
  throw timeoutError;
}

export function ensureCloudReadyWithPrompt() {
  if (cloudWakeupPromise) {
    return cloudWakeupPromise;
  }

  cloudWakeupPromise = (async () => {
    const modalRes = await showModal({
      title: "服务启动中",
      content:
        "当前云托管服务正在自动启动，预计需要 30~60 秒。是否等待服务恢复后自动重试？",
      confirmText: "等待恢复",
      cancelText: "稍后再试",
      showCancel: true,
    });

    if (!modalRes?.confirm) {
      const cancelError = new Error("已取消等待服务启动");
      cancelError.code = "CLOUD_WAKEUP_CANCEL";
      throw cancelError;
    }

    await waitForCloudReady();
    uni.showToast({
      title: "服务已恢复，正在重试",
      icon: "none",
      mask: true,
    });
  })().finally(() => {
    cloudWakeupPromise = null;
  });

  return cloudWakeupPromise;
}
