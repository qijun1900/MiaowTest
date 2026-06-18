// ─────────────────────────────────────────────────────────────────────────────
// log/events.js — 日志事件契约层
// ──────────────────────────────────────────────────────────���──────────────────

export const LOG_MODULES = Object.freeze({
  APP: "app",
  AUTH: "auth",
});

export const LOG_RESULTS = Object.freeze({
  SUCCESS: "success",
  FAIL: "fail",
  UNKNOWN: "unknown",
});

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
  AUTH_LOGIN_SEND_VERIFY_CODE: {
    eventName: "auth.login_send_verify_code",
    module: LOG_MODULES.AUTH,
    desc: "登录/注册发送验证码",
  },
});

export const LOG_EVENTS = Object.freeze(
  Object.fromEntries(
    Object.entries(LOG_EVENT_DICT).map(([key, value]) => [
      key,
      value.eventName,
    ]),
  ),
);

const MODULE_VALUES = new Set(Object.values(LOG_MODULES));

function inferModuleFromEventName(
  eventName,
  fallbackModule = LOG_MODULES.GENERAL,
) {
  const prefix = String(eventName || "").split(".")[0];
  return MODULE_VALUES.has(prefix) ? prefix : fallbackModule;
}

export function normalizeEventInput(
  eventInput,
  fallbackModule = LOG_MODULES.GENERAL,
) {
  if (!eventInput) return null;

  if (typeof eventInput === "string") {
    if (LOG_EVENT_DICT[eventInput]) {
      return LOG_EVENT_DICT[eventInput];
    }

    return {
      eventName: eventInput,
      module: inferModuleFromEventName(eventInput, fallbackModule),
    };
  }

  if (typeof eventInput === "object") {
    if (eventInput.key && LOG_EVENT_DICT[eventInput.key]) {
      return LOG_EVENT_DICT[eventInput.key];
    }

    if (eventInput.eventName) {
      return {
        eventName: eventInput.eventName,
        module:
          eventInput.module ||
          inferModuleFromEventName(eventInput.eventName, fallbackModule),
      };
    }
  }

  return null;
}
