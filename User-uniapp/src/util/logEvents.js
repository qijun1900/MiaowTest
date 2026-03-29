// ─────────────────────────────────────────────────────────────────────────────
// logEvents.js — 日志事件契约层
//
// 职责：
//   1. 定义所有合法的枚举值（模块名、结果值），防止业务层散落魔法字符串。
//   2. 维护事件字典（LOG_EVENT_DICT），作为事件名称的唯一来源。
//   3. 提供 normalizeEventInput 工具函数，把业务层的任意写法统一成标准结构。
//
// 本文件不含任何运行时逻辑，只做"规范约束"，可在任意端安全引入。
// ─────────────────────────────────────────────────────────────────────────────

// ── 模块枚举 ──────────────────────────────────────────────────────────────────
// 用于日志条目的 module 字段，标明该日志归属哪个业务模块。
// Object.freeze 保证枚举值在运行时不可被意外修改。
// 新增业务模块时在此处添加，例如：EXAM: 'exam'、QUESTION: 'question'。
export const LOG_MODULES = Object.freeze({
  APP: "app", // 应用级别（启动、前后台切换等）
  AUTH: "auth", // 认证模块（登录、登出、token 刷新等）
});

// ── 结果枚举 ──────────────────────────────────────────────────────────────────
// 用于日志条目的 result 字段，标明该次操作的执行结果。
// 调用 track() 时通过 options.result 传入，建议优先使用枚举而非裸字符串。
export const LOG_RESULTS = Object.freeze({
  SUCCESS: "success", // 操作成功
  FAIL: "fail", // 操作失败（可配合 errorCode / errorMessage 使用）
  UNKNOWN: "unknown", // 结果未知（默认值，用于无明确结果的埋点）
});

// ── 事件完整字典（内部使用）───────────────────────────────────────────────────
// 每个条目包含：
//   eventName — 实际写入日志的字符串，采用 "模块.动作" 格式，便于服务端按前缀过滤
//   module    — 归属模块，来自 LOG_MODULES 枚举
//   desc      — 可读描述，仅供开发者维护时参考，不上报到服务端
//
// 业务层调用 track('APP_LAUNCH') 时，SDK 会查此字典把 key 解析成完整定义。
// 新增事件时在此处注册，避免相同事件被以不同字符串上报。
export const LOG_EVENT_DICT = Object.freeze({
  APP_LAUNCH: {
    eventName: "app.launch",
    module: LOG_MODULES.APP,
    desc: "应用启动",
  },
  APP_SHOW: {
    eventName: "app.show",
    module: LOG_MODULES.APP,
    desc: "应用切前台",
  },
  APP_HIDE: {
    eventName: "app.hide",
    module: LOG_MODULES.APP,
    desc: "应用切后台",
  },

  // ── 认证模块事件 ────────────────────────────────────────────────────────────
  // 覆盖登录、登出、静默登录、注册、token 刷新五个核心认证动作。
  // 建议配合 result（SUCCESS/FAIL）+ errorCode + bizId（用户 ID）一起上报。

  AUTH_LOGIN: {
    eventName: "auth.login",
    module: LOG_MODULES.AUTH,
    desc: "用户主动登录（账号密码 / 手机号等）",
  },
  AUTH_AUTO_LOGIN: {
    eventName: "auth.auto_login",
    module: LOG_MODULES.AUTH,
    desc: "静默自动登录（启动时读取本地 token 校验）",
  },
  AUTH_REGISTER: {
    eventName: "auth.register",
    module: LOG_MODULES.AUTH,
    desc: "用户注册",
  },
  AUTH_LOGOUT: {
    eventName: "auth.logout",
    module: LOG_MODULES.AUTH,
    desc: "用户主动登出",
  },
  AUTH_TOKEN_REFRESH: {
    eventName: "auth.token_refresh",
    module: LOG_MODULES.AUTH,
    desc: "Token 续期刷新（过期后自动请求新 token）",
  },
});

// ── 事件精简视图（对外暴露给业务层）──────────────────────────────────────────
// 由 LOG_EVENT_DICT 自动派生，格式为 { APP_LAUNCH: 'app.launch', ... }。
// 业务层通常只需要 eventName，使用此视图比直接操作字典更简洁：
//   import { LOG_EVENTS } from './logEvents';
//   logSDK.track(LOG_EVENTS.APP_LAUNCH);
export const LOG_EVENTS = Object.freeze(
  Object.fromEntries(
    Object.entries(LOG_EVENT_DICT).map(([key, value]) => [
      key,
      value.eventName,
    ]),
  ),
);

// ── 内部工具：模块合法值集合，用于快速判断前缀是否合法 ───────────────────────
const MODULE_VALUES = new Set(Object.values(LOG_MODULES));

// ── 内部工具：从 eventName 推断所属模块 ──────────────────────────────────────
// 规则：取 eventName 中第一个 '.' 之前的部分作为模块前缀，若命中枚举则返回该值。
// 示例：
//   'app.launch'    → 前缀 'app'    → 命中 LOG_MODULES → 返回 'app'
//   'custom.click'  → 前缀 'custom' → 未命中          → 返回 fallbackModule
//
// 该函数仅在业务层传入自定义（未在字典中注册）的 eventName 时才会被调用。
function inferModuleFromEventName(
  eventName,
  fallbackModule = LOG_MODULES.GENERAL,
) {
  const prefix = String(eventName || "").split(".")[0];
  return MODULE_VALUES.has(prefix) ? prefix : fallbackModule;
}

// ── 核心工具函数：统一解析事件输入 ───────────────────────────────────────────
// 将业务层传入的任意形式事件标识，统一输出为 { eventName, module } 结构。
//
// 支持三种传入方式：
//
//   ① 字典 key（推荐）
//      normalizeEventInput('APP_LAUNCH')
//      → 命中 LOG_EVENT_DICT → 返回 { eventName: 'app.launch', module: 'app', desc: '...' }
//
//   ② 自定义字符串（灵活扩展）
//      normalizeEventInput('exam.submit')
//      → 未命中字典 → 自动推断 module → { eventName: 'exam.submit', module: 'exam' 或 fallback }
//
//   ③ 对象（高级用法）
//      normalizeEventInput({ key: 'APP_LAUNCH' })          → 同方式①
//      normalizeEventInput({ eventName: 'exam.submit' })   → 同方式②
//
// 返回值：
//   成功 → { eventName: string, module: string, [desc]: string }
//   失败 → null（调用方应对 null 做静默忽略处理）
//
// 参数：
//   eventInput     — 事件标识，见上方三种形式
//   fallbackModule — 无法推断模块时的兜底值，默认为 LOG_MODULES.GENERAL
export function normalizeEventInput(
  eventInput,
  fallbackModule = LOG_MODULES.GENERAL,
) {
  if (!eventInput) return null;

  // ── 字符串形式 ────────────────────────────────────────────────────────────
  if (typeof eventInput === "string") {
    // 先尝试作为 key 查字典（方式①）
    if (LOG_EVENT_DICT[eventInput]) {
      return LOG_EVENT_DICT[eventInput];
    }

    // 未命中字典则视为自定义 eventName，自动推断模块（方式②）
    return {
      eventName: eventInput,
      module: inferModuleFromEventName(eventInput, fallbackModule),
    };
  }

  // ── 对象形式 ──────────────────────────────────────────────────────────────
  if (typeof eventInput === "object") {
    // 对象带 key 字段，尝试查字典（方式③-a）
    if (eventInput.key && LOG_EVENT_DICT[eventInput.key]) {
      return LOG_EVENT_DICT[eventInput.key];
    }

    // 对象直接提供 eventName，自动推断模块（方式③-b）
    if (eventInput.eventName) {
      return {
        eventName: eventInput.eventName,
        module:
          eventInput.module ||
          inferModuleFromEventName(eventInput.eventName, fallbackModule),
      };
    }
  }

  // 无法解析，返回 null，由调用方（track）决定如何处理
  return null;
}
