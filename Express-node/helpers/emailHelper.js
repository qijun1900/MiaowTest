const nodemailer = require("nodemailer");
require("dotenv").config();

// ─────────────────────────────────────────────────────────────────────────────
// 服务商预设配置
// 只需在 .env 中设置 EMAIL_PROVIDER 即可自动匹配 host / port / secure
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDER_PRESETS = {
  /**
   * 阿里云邮件推送 DirectMail
   * 控制台: https://dm.console.aliyun.com
   * 需要: 绑定域名 + DNS验证 + 创建发信地址 + 设置SMTP密码
   */
  aliyun: {
    host: "smtpdm.aliyun.com",
    port: 465,
    secure: true,
    // 阿里云要求 EHLO 域名与发信域名一致，取 EMAIL_USER 的域名部分
    greetingHost: null, // 动态填充，见 resolveConfig()
    label: "阿里云邮件推送",
  },

  /**
   * 腾讯云邮件推送 SES
   * 控制台: https://console.cloud.tencent.com/ses
   * 需要: 创建发信域名(可用默认) + 创建发信地址 + 新建SMTP密码
   */
  tencent: {
    host: "smtp.qcloudmail.com",
    port: 465,
    secure: true,
    greetingHost: null,
    label: "腾讯云邮件推送",
  },

  /**
   * QQ 邮箱（个人账号，仅限开发测试）
   * 需要: 邮箱网页版 → 设置 → 账户 → 开启IMAP/SMTP → 生成授权码
   * ⚠️  EMAIL_PASS 填写授权码，不是 QQ 登录密码
   */
  qq: {
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    greetingHost: "qq.com",
    label: "QQ邮箱",
  },

  /**
   * 163 邮箱（个人账号，仅限开发测试）
   * 需要: 163网页版 → 设置 → POP3/SMTP/IMAP → 开启SMTP → 生成授权码
   * ⚠️  163 对 EHLO 主机名校验严格，greetingHost 必须设为合法域名
   */
  163: {
    host: "smtp.163.com",
    port: 465,
    secure: true,
    greetingHost: "163.com",
    label: "163邮箱",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 验证码内存存储
// 结构: email -> { code, expireAt, sendCount, lastSendAt }
// ─────────────────────────────────────────────────────────────────────────────
const verifyCodeStore = new Map();

/** 验证码有效期：10 分钟 */
const CODE_TTL = 10 * 60 * 1000;

/** 同一邮箱最短重发间隔：60 秒 */
const RESEND_INTERVAL = 60 * 1000;

/** 同一邮箱每小时最多发送次数 */
const MAX_SEND_PER_HOUR = 10;

// ─────────────────────────────────────────────────────────────────────────────
// 内部工具函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 生成 6 位纯数字验证码
 * @returns {string}
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 从邮箱地址中提取域名部分
 * @param {string} email
 * @returns {string}  例如 "noreply@example.com" → "example.com"
 */
function extractDomain(email) {
  const parts = (email || "").split("@");
  return parts.length === 2 ? parts[1] : "localhost";
}

/**
 * 根据 EMAIL_PROVIDER 环境变量解析最终 SMTP 配置
 * 优先级: EMAIL_PROVIDER 预设 > EMAIL_HOST / EMAIL_PORT / EMAIL_SECURE 手动配置
 * @returns {{ host, port, secure, greetingHost, label }}
 */
function resolveConfig() {
  const user = process.env.EMAIL_USER || "";
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();

  if (provider && PROVIDER_PRESETS[provider]) {
    const preset = { ...PROVIDER_PRESETS[provider] };
    // 阿里云/腾讯云：EHLO 主机名取发信地址的域名，与发信域名保持一致
    if (!preset.greetingHost) {
      preset.greetingHost = extractDomain(user);
    }
    return preset;
  }

  // 未指定服务商时，回退到手动配置
  return {
    host: process.env.EMAIL_HOST || "smtp.qq.com",
    port: parseInt(process.env.EMAIL_PORT || "465", 10),
    secure: process.env.EMAIL_SECURE !== "false",
    greetingHost: process.env.EMAIL_GREETING_HOST || extractDomain(user),
    label: "自定义 SMTP",
  };
}

/**
 * 创建 nodemailer 传输实例
 * 每次调用重建，避免长连接断开后静默失败
 * @returns {nodemailer.Transporter}
 */
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "邮件服务未配置，请在 .env 中设置 EMAIL_USER 和 EMAIL_PASS。\n" +
        "可选设置 EMAIL_PROVIDER=aliyun|tencent|qq|163 自动匹配服务商。",
    );
  }

  const cfg = resolveConfig();

  const transportOptions = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    // EHLO 主机名：部分服务商（163、阿里云）会校验，设置为发信域名
    name: cfg.greetingHost,
    auth: { user, pass },
    tls: {
      // 兼容部分自签证书或未完整配置的服务器（如内网 SMTP）
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    // 连接超时 10 秒，防止网络问题导致接口长时间挂起
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  console.log(`[emailHelper] 使用 ${cfg.label}（${cfg.host}:${cfg.port}）`);

  return nodemailer.createTransport(transportOptions);
}

// 邮件模板按业务类型差异化呈现
const EMAIL_TEMPLATES = {
  register: {
    badge: "注册验证",
    accent: "#3c9cff",
    accentSoft: "#ecf5ff",
    title: "欢迎加入",
    intro: (appName) =>
      `感谢您选择 <strong style="color:#303133;">${appName}</strong>，请使用以下验证码完成账号注册：`,
    tips: [
      "验证码有效期 <strong>10 分钟</strong>，请尽快完成注册。",
      "完成注册即代表您同意我们的服务条款与隐私政策。",
      "请勿将验证码告知任何人，工作人员不会主动索取。",
    ],
    footer: "如非本人操作，请忽略此邮件，无需做任何处理。",
  },
  reset: {
    badge: "安全验证",
    accent: "#f56c6c",
    accentSoft: "#fef0f0",
    title: "找回密码",
    intro: (appName) =>
      `您正在重置 <strong style="color:#303133;">${appName}</strong> 账号的登录密码，请使用以下验证码完成身份验证：`,
    tips: [
      "验证码有效期 <strong>10 分钟</strong>，请尽快完成操作。",
      "重置密码后，所有已登录设备将被强制下线。",
      "请勿将验证码告知任何人，工作人员不会主动索取。",
    ],
    footer:
      "如果这不是您本人操作，您的账号可能存在安全风险，建议尽快登录修改密码。",
  },
};

/**
 * 构建验证码邮件 HTML 正文
 * @param {string} code 6 位验证码
 * @param {"register"|"reset"} type 业务类型
 * @returns {string}
 */
function buildEmailHtml(code, type = "register") {
  const tpl = EMAIL_TEMPLATES[type] || EMAIL_TEMPLATES.register;
  const appName = process.env.APP_NAME || "答题系统";
  const year = new Date().getFullYear();

  const tipsHtml = tpl.tips
    .map(
      (tip) =>
        `<tr><td style="padding:4px 0;color:#606266;font-size:13px;line-height:1.7;">· ${tip}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f5f7fa;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border:1px solid #ebeef5;border-radius:8px;overflow:hidden;">
          <!-- 顶部标识条（左侧色块 + 应用名） -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #ebeef5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="display:inline-block;width:4px;height:18px;background:${tpl.accent};vertical-align:middle;margin-right:10px;border-radius:2px;"></span>
                    <span style="font-size:16px;font-weight:600;color:#303133;vertical-align:middle;">${appName}</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:4px 10px;background:${tpl.accentSoft};color:${tpl.accent};font-size:12px;border-radius:4px;">
                      ${tpl.badge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- 正文 -->
          <tr>
            <td style="padding:36px 32px 8px;">
              <h2 style="margin:0 0 18px;color:#303133;font-size:20px;font-weight:600;">
                ${tpl.title}
              </h2>
              <p style="margin:0 0 28px;color:#606266;font-size:14px;line-height:1.7;">
                ${tpl.intro(appName)}
              </p>
              <!-- 验证码区域 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center"
                      style="background:${tpl.accentSoft};border:1px dashed ${tpl.accent};border-radius:6px;padding:22px 0;">
                    <div style="color:#909399;font-size:12px;margin-bottom:8px;">您的验证码</div>
                    <span style="font-size:36px;font-weight:700;color:${tpl.accent};
                                 letter-spacing:10px;font-family:Consolas,'Courier New',monospace;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>
              <!-- 提示列表 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${tipsHtml}
              </table>
            </td>
          </tr>
          <!-- 页脚 -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #ebeef5;background:#fafafa;">
              <p style="margin:0 0 6px;color:#909399;font-size:12px;line-height:1.6;">
                ${tpl.footer}
              </p>
              <p style="margin:0;color:#c0c4cc;font-size:12px;line-height:1.6;">
                此邮件由系统自动发送，请勿直接回复。&copy; ${year} ${appName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 对外暴露的核心方法
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 发送邮箱验证码
 * @param {string} email 目标邮箱地址
 * @param {"register"|"reset"} type 业务类型，决定邮件主题与正文文案
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function sendVerifyCode(email, type = "register") {
  const safeType = type === "reset" ? "reset" : "register";
  if (!email || typeof email !== "string") {
    return { success: false, message: "邮箱地址不能为空" };
  }

  const emailLower = email.toLowerCase().trim();

  // ── 频率限制 ──────────────────────────────────────────────────────────────
  const existing = verifyCodeStore.get(emailLower);
  const now = Date.now();

  if (existing) {
    if (now - existing.lastSendAt < RESEND_INTERVAL) {
      const waitSec = Math.ceil(
        (RESEND_INTERVAL - (now - existing.lastSendAt)) / 1000,
      );
      return {
        success: false,
        message: `发送太频繁，请 ${waitSec} 秒后再试`,
      };
    }

    if (
      existing.sendCount >= MAX_SEND_PER_HOUR &&
      now - existing.lastSendAt < 60 * 60 * 1000
    ) {
      return {
        success: false,
        message: "该邮箱发送次数已达上限，请 1 小时后再试",
      };
    }
  }

  // ── 生成并缓存验证码 ───────────────────────────────────────────────────────
  const code = generateCode();
  verifyCodeStore.set(emailLower, {
    code,
    expireAt: now + CODE_TTL,
    sendCount: (existing?.sendCount || 0) + 1,
    lastSendAt: now,
  });

  // ── 发送邮件 ───────────────────────────────────────────────────────────────
  try {
    const transporter = createTransporter();
    const appName = process.env.APP_NAME || "答题系统";
    const senderName = process.env.EMAIL_SENDER_NAME || appName;
    const subjectPrefix = safeType === "reset" ? "找回密码验证码" : "注册验证码";
    const textIntro =
      safeType === "reset"
        ? `您正在重置 ${appName} 账号密码`
        : `您正在注册 ${appName} 账号`;

    await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER}>`,
      to: emailLower,
      subject: `【${appName}】${subjectPrefix}：${code}`,
      html: buildEmailHtml(code, safeType),
      // 纯文本降级，兼容不支持 HTML 的邮件客户端
      text: `${textIntro}，验证码是：${code}，有效期 10 分钟，请勿泄露。`,
    });

    console.log(`[emailHelper] 验证码已发送 → ${emailLower}`);
    return { success: true, message: "验证码已发送，请查收邮件" };
  } catch (err) {
    // 发送失败回滚，不占用发送次数
    verifyCodeStore.delete(emailLower);
    console.error("[emailHelper] 邮件发送失败:", err.message);

    // 针对常见错误给出更友好的提示
    if (err.message.includes("535") || err.message.includes("Login")) {
      return {
        success: false,
        message: "邮件账号认证失败，请检查 EMAIL_USER / EMAIL_PASS 配置",
      };
    }
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ETIMEDOUT")
    ) {
      return {
        success: false,
        message: "无法连接邮件服务器，请检查 EMAIL_HOST / EMAIL_PORT 配置",
      };
    }
    if (err.message.includes("未配置")) {
      return { success: false, message: err.message };
    }

    return { success: false, message: "邮件发送失败，请稍后重试" };
  }
}

/**
 * 校验验证码
 * @param {string} email 邮箱地址
 * @param {string} code  用户填写的验证码
 * @returns {{ valid: boolean, message: string }}
 */
function verifyCode(email, code) {
  if (!email || !code) {
    return { valid: false, message: "邮箱或验证码不能为空" };
  }

  const emailLower = email.toLowerCase().trim();
  const record = verifyCodeStore.get(emailLower);

  if (!record) {
    return { valid: false, message: "验证码不存在，请重新获取" };
  }

  if (Date.now() > record.expireAt) {
    verifyCodeStore.delete(emailLower);
    return { valid: false, message: "验证码已过期，请重新获取" };
  }

  if (record.code !== String(code).trim()) {
    return { valid: false, message: "验证码错误，请重新输入" };
  }

  // 验证通过后立即销毁，防止重放攻击
  verifyCodeStore.delete(emailLower);
  return { valid: true, message: "验证码正确" };
}

/**
 * 清理所有已过期的验证码记录
 * 每 5 分钟自动执行一次，也可手动调用
 */
function cleanExpiredCodes() {
  const now = Date.now();
  let cleaned = 0;
  for (const [email, record] of verifyCodeStore.entries()) {
    if (now > record.expireAt) {
      verifyCodeStore.delete(email);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[emailHelper] 清理过期验证码 ${cleaned} 条`);
  }
}

// 每 5 分钟自动清理一次
setInterval(cleanExpiredCodes, 5 * 60 * 1000);

module.exports = { sendVerifyCode, verifyCode, cleanExpiredCodes };
