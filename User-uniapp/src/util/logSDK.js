// ─────────────────────────────────────────────────────────────────────────────
// logSDK.js — 日志核心引擎层
//
// 职责：
//   1. 提供 track()（行为埋点）与 reportError()（异常上报）两个对外入口。
//   2. 将日志写入本地内存队列，并实时持久化到 Storage，防止进程意外终止丢数据。
//   3. 通过定时器、网络恢复事件、队列阈值三重触发机制驱动 flush()，把队列内容
//      批量上报到服务端。
//   4. 上报失败时采用指数退避策略重试，超过最大次数后永久丢弃该条日志。
//   5. 自动适配 uni.request（H5 / App / 普通小程序）与 wx.cloud.callContainer
//      （微信云托管）两种请求通道。
//
// 依赖：
//   - logEvents.js  提供枚举常量与事件规范化工具
//   - esc.config.js 提供服务端地址与云托管配置
// ─────────────────────────────────────────────────────────────────────────────

import escconfig from "../config/esc.config";
import {
  LOG_MODULES,
  LOG_RESULTS,
  LOG_EVENTS,
  normalizeEventInput,
} from "./logEvents";

// ── 本地持久化键 ──────────────────────────────────────────────────────────────
// 队列序列化后存储在 uni.Storage 中使用的键名。
// 键名带版本号（v1），若后续队列结构变更，可通过升版本号清空旧格式数据。
const STORAGE_KEY = "uniapp_log_queue_v1";

// ── 默认配置 ──────────────────────────────────────────────────────────────────
// init() 时可传入自定义配置覆盖以下默认值。
const defaultOptions = {
  batchSize: 20, // 队列中待发条数达到此值时，立即触发一次 flush（即时上报）
  maxQueueSize: 500, // 队列条数上限；超出时丢弃最早的数据，优先保留近期日志
  maxRetry: 5, // 单条日志最多允许重试的次数，超过后永久丢弃
  baseRetryDelay: 3000, // 首次重试等待时间（毫秒），后续按指数倍增
  maxRetryDelay: 120000, // 退避延迟上限（毫秒），防止等待时间无限膨胀（最长 2 分钟）
  flushInterval: 15000, // 定时补发间隔（毫秒），每 15s 触发一次 flush
  debug: false, // 开启后向控制台输出 [logSDK] 前缀的调试信息
};

// ── SDK 运行时状态 ─────────────────────────────────────────────────────────────
// 所有可变状态集中在此对象，便于追踪与调试。
const state = {
  inited: false, // 是否已完成初始化（防止重复 init）
  isOnline: true, // 当前网络是否可用（由网络监听器维护）
  isFlushing: false, // 是否正在执行 flush（并发锁，防止同时发起多个上报请求）
  queue: [], // 内存中的日志队列（与 Storage 保持同步）
  timer: null, // 定时补发的 setInterval 句柄
  options: { ...defaultOptions }, // 运行时配置（init 后合并自定义选项）
};

// ── 上报端点路径 ───────────────────────────────────────────────────────────────
// action：用户行为日志，支持批量合并上报
// error ：前端异常日志，逐条单独上报
const endpoint = {
  action: "/uniappAPI/Log/reportActions",
  error: "/uniappAPI/Log/reportError",
};

// ── 调试日志工具 ───────────────────────────────────────────────────────────────
// 仅在 options.debug = true 时输出，生产环境不产生控制台噪音。
function logDebug(...args) {
  if (state.options.debug) {
    console.log("[logSDK]", ...args);
  }
}

// ── 当前时间戳 ─────────────────────────────────────────────────────────────────
// 封装 Date.now()，便于统一替换或在测试中 mock。
function now() {
  return Date.now();
}

// ── 规范化 result 字段 ────────────────────────────────────────────────────────
// 将任意输入（含大小写混合）转为合法枚举值；无法识别时返回 UNKNOWN。
// 例：'SUCCESS' → 'success'，'ok' → 'unknown'
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

// ── 构建服务端根地址 ──────────────────────────────────────────────────────────
// 根据配置决定使用内网穿透地址（tunnelUrl）还是局域网 IP:Port。
function getBaseUrl() {
  return escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;
}

// ── 获取当前运行平台标识 ──────────────────────────────────────────────────────
// 复用项目内平台判定逻辑，保证与请求头约定一致。
// 返回值：'h5' | 'miniapp' | 'app'
function getPlatform() {
  try {
    const appBaseInfo = uni.getAppBaseInfo();
    const uniPlatform = appBaseInfo.uniPlatform;

    if (uniPlatform === "web") return "h5";
    if (uniPlatform === "mp-weixin") return "miniapp";
    if (
      uniPlatform === "app" ||
      uniPlatform === "app-plus" ||
      uniPlatform === "app-android" ||
      uniPlatform === "app-ios"
    ) {
      return "app";
    }

    // 兜底：有 plus 对象则判定为 App，否则默认小程序
    if (typeof plus !== "undefined") return "app";
    return "miniapp";
  } catch {
    if (typeof plus !== "undefined") return "app";
    return "miniapp";
  }
}

// ── 构建日志请求头 ────────────────────────────────────────────────────────────
// 包含：客户端类型标识、平台、鉴权 token、唯一追踪 ID。
// X-Trace-Id 由客户端生成，便于将前端日志与服务端日志关联排查。
function getClientHeaders() {
  const platform = getPlatform();
  // source-client 与 platform 的区别：
  //   platform    → 运行环境（h5 / miniapp / app）
  //   source-client → 请求来源标识（web / miniapp / app），服务端用于路由或权限判断
  const sourceClient =
    platform === "h5" ? "web" : platform === "app" ? "app" : "miniapp";
  const token = uni.getStorageSync("token");

  const headers = {
    "content-type": "application/json",
    "source-client": sourceClient,
    platform,
    // 格式：client_{时间戳}_{随机串}，在同一次请求链路中全局唯一
    "X-Trace-Id": `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };

  // token 不存在时（未登录）不携带 Authorization 头
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ── 安全解析 Storage 中的队列字符串 ──────────────────────────────────────────
// 防御 JSON 解析异常与非数组数据，任何异常均返回空数组，不影响主流程。
function safeParseQueue(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── 从 Storage 恢复队列到内存 ────────────────────────────────────────────────
// 在 init() 阶段调用，确保上次未发完的日志不会丢失。
function loadQueue() {
  const raw = uni.getStorageSync(STORAGE_KEY);
  state.queue = safeParseQueue(raw);
}

// ── 将内存队列持久化到 Storage ────────────────────────────────────────────────
// 每次 enqueue、markRetry、removeByIds 后都应调用此函数，保持两端同步。
function saveQueue() {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(state.queue));
  } catch (e) {
    logDebug("saveQueue failed", e);
  }
}

// ── 队列超限裁剪 ──────────────────────────────────────────────────────────────
// 当队列长度超过 maxQueueSize 时，从头部（最老的数据）删除多余条目。
// 策略：优先保留近期日志，牺牲较早的数据。
function trimQueueIfNeeded() {
  if (state.queue.length <= state.options.maxQueueSize) return;
  const overflow = state.queue.length - state.options.maxQueueSize;
  state.queue.splice(0, overflow);
}

// ── 日志入队 ──────────────────────────────────────────────────────────────────
// 将一条日志封装成队列条目，写入内存队列并立即持久化。
// 字段说明：
//   id         — 唯一标识，格式：时间戳_随机串，用于重试时精确定位条目
//   type       — 'action'（行为埋点）或 'error'（前端异常）
//   payload    — 实际上报给服务端的数据体
//   retryCount — 已重试次数，初始为 0
//   nextRetryAt— 下次允许重试的时间戳（毫秒），初始为当前时间（立即可发）
//   createdAt  — 入队时间，ISO 格式，便于服务端或调试时排查时序问题
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

// ── 指数退避延迟计算 ──────────────────────────────────────────────────────────
// 公式：baseRetryDelay × 2^retryCount，并受 maxRetryDelay 约束。
// 示例（baseRetryDelay=3000, maxRetryDelay=120000）：
//   第 1 次重试 → 6s
//   第 2 次重试 → 12s
//   第 3 次重试 → 24s
//   第 4 次重试 → 48s
//   第 5 次重试 → 96s（未超上限）
//   第 6 次重试 → 120s（触顶上限）
function computeRetryDelay(retryCount) {
  const expDelay = state.options.baseRetryDelay * Math.pow(2, retryCount);
  return Math.min(expDelay, state.options.maxRetryDelay);
}

// ── 标记重试 ──────────────────────────────────────────────────────────────────
// 对上报失败的条目更新重试状态：
//   - retryCount 累加，超过 maxRetry 则从队列中永久删除（不再重试）。
//   - nextRetryAt 按指数退避延迟推后，避免立即重试加重服务端压力。
function markRetry(ids) {
  const idSet = new Set(ids);
  const current = now();

  state.queue = state.queue.filter((item) => {
    if (!idSet.has(item.id)) return true; // 不在本批次，直接保留

    const nextRetryCount = (item.retryCount || 0) + 1;
    if (nextRetryCount > state.options.maxRetry) {
      // 超过最大重试次数，永久丢弃该条日志
      logDebug("drop item after max retry", item.id);
      return false;
    }

    item.retryCount = nextRetryCount;
    item.nextRetryAt = current + computeRetryDelay(nextRetryCount);
    return true;
  });
}

// ── 按 id 批量删除队列条目 ────────────────────────────────────────────────────
// 上报成功后调用，将已确认到达服务端的条目从队列中移除。
function removeByIds(ids) {
  if (!ids || ids.length === 0) return;
  const idSet = new Set(ids);
  state.queue = state.queue.filter((item) => !idSet.has(item.id));
}

// ── 通用 HTTP 请求（uni.request 通道）────────────────────────────────────────
// 适用场景：H5、App、非云托管小程序。
// 自动补全 baseUrl，统一携带鉴权与平台识别请求头。
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

// ── 微信云托管请求（wx.cloud.callContainer 通道）──────────────────────────────
// 适用场景：部署在微信云托管的后端，无需暴露真实服务器 IP，
//           由微信网关负责路由转发，安全性更高。
// X-WX-SERVICE 头指定目标云托管服务名称，由 escconfig.cloudService 配置。
function requestByCloud(path, data, timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (!wx?.cloud) {
      reject(new Error("wx.cloud unavailable"));
      return;
    }

    wx.cloud.callContainer({
      config: { env: escconfig.cloudEnv }, // 云开发环境 ID
      path,
      method: "POST",
      timeout,
      data,
      header: {
        "X-WX-SERVICE": escconfig.cloudService, // 目标云托管服务名
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

// ── 统一请求入口 ──────────────────────────────────────────────────────────────
// 根据配置自动选择请求通道，调用方无需关心底层实现。
// "silent" 含义：该函数内部不会向业务层 throw，失败由 markRetry 处理。
function silentRequest(path, data, timeout = 8000) {
  if (escconfig.useCloudContainer && typeof wx !== "undefined") {
    return requestByCloud(path, data, timeout);
  }
  return requestByUni(path, data, timeout);
}

// ── 获取当前所有到期条目 ──────────────────────────────────────────────────────
// "到期"指 nextRetryAt <= now()，即已过重试冷却期、可以发送的条目。
// 还在冷却期内的条目（因退避延迟）会被跳过，等待下一次 flush 时再判断。
function getDueItems() {
  const current = now();
  return state.queue.filter((item) => (item.nextRetryAt || 0) <= current);
}

// ── 上报行为日志（批量）──────────────────────────────────────────────────────
// 将多条 action 日志合并成一个请求体发送，减少 HTTP 请求次数。
// 上报成功 → 从队列删除；失败 → 标记重试（指数退避）。
async function flushActions(items) {
  if (items.length === 0) return;
  const ids = items.map((item) => item.id);

  try {
    await silentRequest(endpoint.action, {
      events: items.map((item) => item.payload),
    });
    removeByIds(ids); // 成功后清除已发条目
  } catch {
    markRetry(ids); // 失败后更新重试状态
  }
}

// ── 上报错误日志（逐条）──────────────────────────────────────────────────────
// 错误日志单独逐条发送，而非批量合并。
// 原因：每条错误的重试状态独立管理，批量发送时若部分失败难以精确定位。
async function flushErrors(items) {
  for (const item of items) {
    try {
      await silentRequest(endpoint.error, item.payload);
      removeByIds([item.id]); // 成功后删除该条
    } catch {
      markRetry([item.id]); // 失败后仅对该条标记重试
    }
  }
}

// ── 核心上报流程 ──────────────────────────────────────────────────────────────
// 三重短路保护：
//   ① isFlushing — 防并发，上一次 flush 未结束前不重复执行
//   ② isOnline   — 离线时跳过（force=true 可强制发送，如 App 退后台）
//   ③ 空队列     — 无数据时立即返回
//
// 执行步骤：
//   1. 取出所有"到期"条目（或 force 时取全部）
//   2. 将 action 类日志批量上报（最多 batchSize 条）
//   3. 将 error 类日志逐条上报（每次最多 5 条，避免阻塞）
//   4. 无论成功失败，最后都同步持久化队列状态
async function flush({ force = false } = {}) {
  if (state.isFlushing) return; // ① 并发锁
  if (!force && !state.isOnline) return; // ② 离线检查
  if (state.queue.length === 0) return; // ③ 空队检查

  state.isFlushing = true; // 上锁

  try {
    const dueItems = force ? [...state.queue] : getDueItems();
    if (dueItems.length === 0) return;

    // 行为日志：批量合并，受 batchSize 限制，避免单次请求体过大
    const actionItems = dueItems
      .filter((item) => item.type === "action")
      .slice(0, state.options.batchSize);

    // 错误日志：逐条发送，每次最多处理 5 条
    const errorItems = dueItems
      .filter((item) => item.type === "error")
      .slice(0, 5);

    await flushActions(actionItems);
    await flushErrors(errorItems);

    // 上报完成后将队列变更（删除/重试状态更新）同步到 Storage
    saveQueue();
  } finally {
    state.isFlushing = false; // 无论成功失败都释放锁
  }
}

// ── 用户行为埋点入口 ──────────────────────────────────────────────────────────
// 对外暴露的主要 API，用于记录用户行为事件（点击、提交、页面访问等）。
//
// 参数：
//   eventName — 事件标识，支持字典 key（'APP_LAUNCH'）、自定义字符串（'exam.submit'）
//               或对象形式（{ key: 'APP_LAUNCH' } / { eventName: 'x.y' }）
//   options   — 可选配置：
//     module       — 归属模块，优先级高于从 eventName 推断的值
//     bizId        — 业务关联 ID（如题目 ID、试卷 ID），便于服务端关联查询
//     result       — 操作结果，使用 LOG_RESULTS 枚举值
//     errorCode    — 失败时的错误码
//     errorMessage — 失败时的错误描述
//     metadata     — 自定义扩展字段，可放任意 JSON 可序列化数据
//
// 触发即时上报条件：在线 且 队列长度达到 batchSize 阈值。
function track(eventName, options = {}) {
  // 将任意写法的 eventName 规范化为 { eventName, module } 结构
  const normalized = normalizeEventInput(
    eventName,
    options.module || LOG_MODULES.GENERAL,
  );
  // 无法解析时静默忽略，不影响业务主流程
  if (!normalized || !normalized.eventName) return;

  enqueue("action", {
    eventName: normalized.eventName,
    module: options.module || normalized.module || LOG_MODULES.GENERAL,
    bizId: options.bizId || "",
    result: normalizeResult(options.result),
    errorCode: options.errorCode || "",
    errorMessage: options.errorMessage || "",
    metadata: options.metadata || null,
    clientTime: new Date().toISOString(), // 记录客户端时间，区别于服务端接收时间
  });

  // 队列达到批量阈值时主动触发上报，无需等待定时器
  if (state.isOnline && state.queue.length >= state.options.batchSize) {
    flush();
  }
}

// ── 前端异常上报入口 ──────────────────────────────────────────────────────────
// 对外暴露的异常上报 API，用于记录 Error 对象或自定义错误信息。
// 异常日志入队后立即触发 flush，尽快发送，减少因进程被杀导致丢失的概率。
//
// 参数：
//   error   — 原生 Error 对象或字符串描述
//   context — 异常发生的上下文信息：
//     route      — 发生错误时的页面路由
//     method     — 发生错误的方法名（如 'onLoad'、'submitAnswer'）
//     statusCode — HTTP 状态码或自定义错误级别（默认 500）
//     extra      — 额外调试信息，可放任意 JSON 可序列化数据
function reportError(error, context = {}) {
  const isErrorObj = error instanceof Error;

  enqueue("error", {
    errorName: isErrorObj ? error.name : "ClientError",
    message: isErrorObj ? error.message : String(error || "Unknown error"),
    stack: isErrorObj ? String(error.stack || "") : "", // 堆栈信息，仅 Error 对象有效
    route: context.route || "",
    method: context.method || "",
    statusCode: Number(context.statusCode) || 500,
    extra: context.extra || null,
    clientTime: new Date().toISOString(),
  });

  // 错误日志优先级高，入队后立即尝试上报
  if (state.isOnline) {
    flush();
  }
}

// ── 更新网络状态并触发补发 ────────────────────────────────────────────────────
// 网络由断开恢复为连接时，自动触发一次 flush 补发离线期间积压的日志。
function setOnlineStatus(online) {
  state.isOnline = !!online;
  if (state.isOnline) {
    logDebug("network recovered, flushing queue...");
    flush();
  }
}

// ── 绑定网络状态监听器 ────────────────────────────────────────────────────────
// 初始化时调用：
//   1. 立即查询当前网络状态，初始化 isOnline。
//   2. 持续监听网络变化，网络恢复时自动触发补发。
function bindNetworkListener() {
  uni.getNetworkType({
    success: (res) => {
      setOnlineStatus(res.networkType !== "none");
    },
    fail: () => {
      // 查询失败时保守地假设有网，避免无谓地阻断上报
      setOnlineStatus(true);
    },
  });

  if (typeof uni.onNetworkStatusChange === "function") {
    uni.onNetworkStatusChange((res) => {
      setOnlineStatus(!!res.isConnected);
    });
  }
}

// ── 启动定时补发定时器 ────────────────────────────────────────────────────────
// 每隔 flushInterval 毫秒触发一次 flush，处理：
//   - 未达到 batchSize 阈值而积压的行为日志
//   - 因退避冷却到期后可重试的失败日志
function startFlushTimer() {
  if (state.timer) {
    clearInterval(state.timer); // 防止重复注册定时器
  }
  state.timer = setInterval(() => {
    flush();
  }, state.options.flushInterval);
}

// ── SDK 初始化 ────────────────────────────────────────────────────────────────
// 应在应用启动时调用一次（如 App.vue onLaunch）。
// 内置幂等保护：重复调用无副作用，不会注册多个定时器或监听器。
//
// 初始化流程：
//   1. 合并自定义配置与默认配置
//   2. 从 Storage 恢复上次未发完的队列
//   3. 监听网络状态变化
//   4. 启动定时补发定时器
//   5. 立即尝试发送存量日志
function init(customOptions = {}) {
  if (state.inited) return; // 幂等保护

  state.options = {
    ...defaultOptions,
    ...customOptions,
  };

  loadQueue(); // 恢复本地持久化队列
  bindNetworkListener(); // 注册网络监听
  startFlushTimer(); // 启动定时补发

  state.inited = true;
  flush(); // 初始化完成后立即尝试上报存量日志
  logDebug("initialized, queue size =", state.queue.length);
}

// ── 获取当前队列长度 ──────────────────────────────────────────────────────────
// 可用于调试或监控页面显示待发日志数量。
function getQueueSize() {
  return state.queue.length;
}

// ── 销毁 SDK ──────────────────────────────────────────────────────────────────
// 清除定时器并重置初始化标志，通常在测试或特殊场景下使用。
// 注意：调用后需重新 init() 才能恢复正常工作。
function destroy() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.inited = false;
}

// ── 默认导出：对外暴露的公共 API ─────────────────────────────────────────────
export default {
  init, // 初始化 SDK
  track, // 记录用户行为事件
  reportError, // 上报前端异常
  flush, // 手动触发一次上报（如 App 切后台时调用）
  getQueueSize, // 获取当前待发日志数量
  destroy, // 销毁 SDK（测试用）
  // 将枚举常量挂载到 SDK 实例上，业务层可通过 logSDK.modules / .results / .events 直接访问
  modules: LOG_MODULES,
  results: LOG_RESULTS,
  events: LOG_EVENTS,
};

// ── 具名导出：供需要直接引用枚举的模块使用 ───────────────────────────────────
export { LOG_MODULES, LOG_RESULTS, LOG_EVENTS };
