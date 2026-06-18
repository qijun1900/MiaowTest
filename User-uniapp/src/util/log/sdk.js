// ─────────────────────────────────────────────────────────────────────────────
// log/sdk.js — 日志核心引擎层
// ─────────────────────────────────────────────────────────────────────────────

import escconfig from "../../config/esc.config";
import { getPlatform, getClientHeader } from "../http/platform";
import {
  LOG_MODULES,
  LOG_RESULTS,
  LOG_EVENTS,
  normalizeEventInput,
} from "./events";

const STORAGE_KEY = "uniapp_log_queue_v1";

const defaultOptions = {
  batchSize: 20,
  maxQueueSize: 500,
  maxRetry: 5,
  baseRetryDelay: 3000,
  maxRetryDelay: 120000,
  flushInterval: 15000,
  debug: false,
};

const state = {
  inited: false,
  isOnline: true,
  isFlushing: false,
  queue: [],
  timer: null,
  options: { ...defaultOptions },
};

const endpoint = {
  action: "/uniappAPI/Log/reportActions",
  error: "/uniappAPI/Log/reportError",
};

function logDebug(...args) {
  if (state.options.debug) {
    console.log("[logSDK]", ...args);
  }
}

function now() {
  return Date.now();
}

function normalizeResult(result) {
  const value = String(result || LOG_RESULTS.UNKNOWN).toLowerCase();
  if (
    value === LOG_RESULTS.SUCCESS ||
    value === LOG_RESULTS.FAIL ||
    value === LOG_RESULTS.UNKNOWN
  ) {
    return value;
  }
  return LOG_RESULTS.UNKNOWN;
}

function getBaseUrl() {
  return escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;
}

function getClientHeaders() {
  const platform = getPlatform();
  const sourceClient = getClientHeader();
  const token = uni.getStorageSync("token");

  const headers = {
    "content-type": "application/json",
    "source-client": sourceClient,
    platform,
    "X-Trace-Id": `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function safeParseQueue(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadQueue() {
  const raw = uni.getStorageSync(STORAGE_KEY);
  state.queue = safeParseQueue(raw);
}

function saveQueue() {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(state.queue));
  } catch (e) {
    logDebug("saveQueue failed", e);
  }
}

function trimQueueIfNeeded() {
  if (state.queue.length <= state.options.maxQueueSize) return;
  const overflow = state.queue.length - state.options.maxQueueSize;
  state.queue.splice(0, overflow);
}

function enqueue(type, payload) {
  state.queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type,
    payload,
    retryCount: 0,
    nextRetryAt: now(),
    createdAt: new Date().toISOString(),
  });

  trimQueueIfNeeded();
  saveQueue();
}

function computeRetryDelay(retryCount) {
  const expDelay = state.options.baseRetryDelay * Math.pow(2, retryCount);
  return Math.min(expDelay, state.options.maxRetryDelay);
}

function markRetry(ids) {
  const idSet = new Set(ids);
  const current = now();

  state.queue = state.queue.filter((item) => {
    if (!idSet.has(item.id)) return true;

    const nextRetryCount = (item.retryCount || 0) + 1;
    if (nextRetryCount > state.options.maxRetry) {
      logDebug("drop item after max retry", item.id);
      return false;
    }

    item.retryCount = nextRetryCount;
    item.nextRetryAt = current + computeRetryDelay(nextRetryCount);
    return true;
  });
}

function removeByIds(ids) {
  if (!ids || ids.length === 0) return;
  const idSet = new Set(ids);
  state.queue = state.queue.filter((item) => !idSet.has(item.id));
}

function requestByUni(path, data, timeout = 8000) {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: "POST",
      timeout,
      header: getClientHeaders(),
      data,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data || {});
        } else {
          reject(new Error(`HTTP_${res.statusCode}`));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

function requestByCloud(path, data, timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (!wx?.cloud) {
      reject(new Error("wx.cloud unavailable"));
      return;
    }

    wx.cloud.callContainer({
      config: { env: escconfig.cloudEnv },
      path,
      method: "POST",
      timeout,
      data,
      header: {
        "X-WX-SERVICE": escconfig.cloudService,
        ...getClientHeaders(),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data || {});
        } else {
          reject(new Error(`HTTP_${res.statusCode}`));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

function silentRequest(path, data, timeout = 8000) {
  if (escconfig.useCloudContainer && typeof wx !== "undefined") {
    return requestByCloud(path, data, timeout);
  }
  return requestByUni(path, data, timeout);
}

function getDueItems() {
  const current = now();
  return state.queue.filter((item) => (item.nextRetryAt || 0) <= current);
}

async function flushActions(items) {
  if (items.length === 0) return;
  const ids = items.map((item) => item.id);

  try {
    await silentRequest(endpoint.action, {
      events: items.map((item) => item.payload),
    });
    removeByIds(ids);
  } catch {
    markRetry(ids);
  }
}

async function flushErrors(items) {
  for (const item of items) {
    try {
      await silentRequest(endpoint.error, item.payload);
      removeByIds([item.id]);
    } catch {
      markRetry([item.id]);
    }
  }
}

async function flush({ force = false } = {}) {
  if (state.isFlushing) return;
  if (!force && !state.isOnline) return;
  if (state.queue.length === 0) return;

  state.isFlushing = true;

  try {
    const dueItems = force ? [...state.queue] : getDueItems();
    if (dueItems.length === 0) return;

    const actionItems = dueItems
      .filter((item) => item.type === "action")
      .slice(0, state.options.batchSize);

    const errorItems = dueItems
      .filter((item) => item.type === "error")
      .slice(0, 5);

    await flushActions(actionItems);
    await flushErrors(errorItems);

    saveQueue();
  } finally {
    state.isFlushing = false;
  }
}

function track(eventName, options = {}) {
  const normalized = normalizeEventInput(
    eventName,
    options.module || LOG_MODULES.GENERAL,
  );
  if (!normalized || !normalized.eventName) return;

  enqueue("action", {
    eventName: normalized.eventName,
    module: options.module || normalized.module || LOG_MODULES.GENERAL,
    bizId: options.bizId || "",
    result: normalizeResult(options.result),
    errorCode: options.errorCode || "",
    errorMessage: options.errorMessage || "",
    metadata: options.metadata || null,
    clientTime: new Date().toISOString(),
  });

  if (state.isOnline && state.queue.length >= state.options.batchSize) {
    flush();
  }
}

function reportError(error, context = {}) {
  const isErrorObj = error instanceof Error;

  enqueue("error", {
    errorName: isErrorObj ? error.name : "ClientError",
    message: isErrorObj ? error.message : String(error || "Unknown error"),
    stack: isErrorObj ? String(error.stack || "") : "",
    route: context.route || "",
    method: context.method || "",
    statusCode: Number(context.statusCode) || 500,
    extra: context.extra || null,
    clientTime: new Date().toISOString(),
  });

  if (state.isOnline) {
    flush();
  }
}

function setOnlineStatus(online) {
  state.isOnline = !!online;
  if (state.isOnline) {
    logDebug("network recovered, flushing queue...");
    flush();
  }
}

function bindNetworkListener() {
  uni.getNetworkType({
    success: (res) => {
      setOnlineStatus(res.networkType !== "none");
    },
    fail: () => {
      setOnlineStatus(true);
    },
  });

  if (typeof uni.onNetworkStatusChange === "function") {
    uni.onNetworkStatusChange((res) => {
      setOnlineStatus(!!res.isConnected);
    });
  }
}

function startFlushTimer() {
  if (state.timer) {
    clearInterval(state.timer);
  }
  state.timer = setInterval(() => {
    flush();
  }, state.options.flushInterval);
}

function init(customOptions = {}) {
  if (state.inited) return;

  state.options = {
    ...defaultOptions,
    ...customOptions,
  };

  loadQueue();
  bindNetworkListener();
  startFlushTimer();

  state.inited = true;
  flush();
  logDebug("initialized, queue size =", state.queue.length);
}

function getQueueSize() {
  return state.queue.length;
}

function destroy() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.inited = false;
}

export default {
  init,
  track,
  reportError,
  flush,
  getQueueSize,
  destroy,
  modules: LOG_MODULES,
  results: LOG_RESULTS,
  events: LOG_EVENTS,
};

export { LOG_MODULES, LOG_RESULTS, LOG_EVENTS };
