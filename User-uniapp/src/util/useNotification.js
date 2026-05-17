const CHANNEL_ID = "app_update";
const CHANNEL_NAME = "应用更新";
const NOTIFICATION_ID = 1001;
const TAG = "[useNotification]";
const DEV = import.meta.env.DEV;

let channelCreated = false;
let cachedManager = null;
let cachedIcon = 0;
let NotificationManager = null;
let NotificationChannel = null;
let Notification = null;

/**
 * 检查当前平台是否为 Android
 */
function isAndroid() {
  try {
    return uni.getSystemInfoSync().platform === "android";
  } catch {
    return false;
  }
}

/**
 * 初始化：获取 NotificationManager 和图标资源 ID
 */
function ensureInit() {
  if (cachedManager) return true;

  const hasPlus = typeof plus !== "undefined";
  const hasAndroid = hasPlus && !!plus.android;
  if (DEV) console.log(`${TAG} ensureInit: plus=${hasPlus}, plus.android=${hasAndroid}`);
  if (!hasPlus || !hasAndroid) return false;

  try {
    if (!NotificationManager) {
      NotificationManager = plus.android.importClass("android.app.NotificationManager");
      if (DEV) console.log(`${TAG} importClass NotificationManager`);
    }
    if (!NotificationChannel) {
      NotificationChannel = plus.android.importClass("android.app.NotificationChannel");
      if (DEV) console.log(`${TAG} importClass NotificationChannel`);
    }
    if (!Notification) {
      Notification = plus.android.importClass("android.app.Notification");
      if (DEV) console.log(`${TAG} importClass Notification`);
    }

    const mainActivity = plus.android.runtimeMainActivity();
    cachedManager = mainActivity.getSystemService("notification");

    // 解析小图标资源 ID —— getApplicationInfo().icon 在 bridge 中返回 undefined
    // 先 importClass 让 bridge 识别 Java 对象类型，再调方法
    const Resources = plus.android.importClass("android.content.res.Resources");
    const res = mainActivity.getResources();
    const pkgName = mainActivity.getPackageName();
    cachedIcon = res.getIdentifier("ic_launcher", "mipmap", pkgName)
      || res.getIdentifier("ic_launcher", "drawable", pkgName)
      || res.getIdentifier("ic_notification", "drawable", pkgName);
    // 应用图标找不到时，用系统内置 drawable
    if (!cachedIcon) {
      try {
        const RDrawable = plus.android.importClass("android.R$drawable");
        cachedIcon = RDrawable.ic_dialog_info || RDrawable.ic_menu_info_details;
      } catch {
        // ignore
      }
    }
    if (DEV) console.log(`${TAG} cachedIcon:`, cachedIcon);

    // 创建通知渠道（Android 8+）
    if (!channelCreated) {
      const channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
      channel.setShowBadge(false);
      cachedManager.createNotificationChannel(channel);
      channelCreated = true;
    }
    return true;
  } catch (e) {
    if (DEV) console.error(`${TAG} 初始化失败:`, e.message);
    return false;
  }
}

/**
 * 显示带进度条的通知
 * @param {string} title - 通知标题
 * @param {number} progress - 进度 0~100
 */
export function showProgress(title, progress) {
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) return;
    try {
      const mainActivity = plus.android.runtimeMainActivity();
      const builder = new Notification.Builder(mainActivity, CHANNEL_ID);
      builder.setSmallIcon(cachedIcon);
      builder.setContentTitle(title);
      builder.setContentText(progress + "%");
      builder.setProgress(100, progress, false);
      builder.setOngoing(true);
      builder.setOnlyAlertOnce(true);
      cachedManager.notify(NOTIFICATION_ID, builder.build());
      if (DEV) console.log(`${TAG} notify progress=${progress}%`);
    } catch (e) {
      if (DEV) console.error(`${TAG} 更新进度通知失败:`, e.message);
    }
  }, 0);
}

/**
 * 显示完成通知（无进度条）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
export function showComplete(title, message) {
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) return;
    try {
      const mainActivity = plus.android.runtimeMainActivity();
      const builder = new Notification.Builder(mainActivity, CHANNEL_ID);
      builder.setSmallIcon(cachedIcon);
      builder.setContentTitle(title);
      builder.setContentText(message);
      builder.setAutoCancel(true);
      cachedManager.notify(NOTIFICATION_ID, builder.build());
      if (DEV) console.log(`${TAG} 完成通知已显示`);
    } catch (e) {
      if (DEV) console.error(`${TAG} 显示完成通知失败:`, e.message);
    }
  }, 0);
}

/**
 * 清除通知
 */
export function clear() {
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) return;
    try {
      cachedManager.cancel(NOTIFICATION_ID);
      if (DEV) console.log(`${TAG} 通知已清除`);
    } catch (e) {
      if (DEV) console.error(`${TAG} 清除通知失败:`, e.message);
    }
  }, 0);
}
