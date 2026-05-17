const CHANNEL_ID = "app_update";
const CHANNEL_NAME = "应用更新";
const NOTIFICATION_ID = 1001;

let channelCreated = false;

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
 * 创建通知渠道（Android 8+ 必需）
 */
function ensureChannel() {
  if (channelCreated) return;
  if (typeof plus === "undefined" || !plus.android) return;

  try {
    const NotificationChannel = plus.android.importClass("android.app.NotificationChannel");
    const NotificationManager = plus.android.importClass("android.app.NotificationManager");
    const mainActivity = plus.android.runtimeMainActivity();
    const manager = mainActivity.getSystemService("notification");
    const channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_LOW);
    channel.setShowBadge(false);
    manager.createNotificationChannel(channel);
    channelCreated = true;
  } catch (e) {
    console.warn("[useNotification] 创建通知渠道失败:", e);
  }
}

/**
 * 显示带进度条的通知
 * @param {string} title - 通知标题
 * @param {number} progress - 进度 0~100
 */
export function showProgress(title, progress) {
  if (!isAndroid()) return;
  ensureChannel();

  try {
    const mainActivity = plus.android.runtimeMainActivity();
    const manager = mainActivity.getSystemService("notification");

    const builder = plus.android.newObject("android.app.Notification$Builder", mainActivity, CHANNEL_ID);
    plus.android.invoke(builder, "setSmallIcon", mainActivity.getApplicationInfo().icon);
    plus.android.invoke(builder, "setContentTitle", title);
    plus.android.invoke(builder, "setContentText", progress + "%");
    plus.android.invoke(builder, "setProgress", 100, progress, false);
    plus.android.invoke(builder, "setOngoing", true);
    plus.android.invoke(builder, "setOnlyAlertOnce", true);

    manager.notify(NOTIFICATION_ID, plus.android.invoke(builder, "build"));
  } catch (e) {
    console.warn("[useNotification] 更新进度通知失败:", e);
  }
}

/**
 * 显示完成通知（无进度条）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
export function showComplete(title, message) {
  if (!isAndroid()) return;
  ensureChannel();

  try {
    const mainActivity = plus.android.runtimeMainActivity();
    const manager = mainActivity.getSystemService("notification");

    const builder = plus.android.newObject("android.app.Notification$Builder", mainActivity, CHANNEL_ID);
    plus.android.invoke(builder, "setSmallIcon", mainActivity.getApplicationInfo().icon);
    plus.android.invoke(builder, "setContentTitle", title);
    plus.android.invoke(builder, "setContentText", message);
    plus.android.invoke(builder, "setAutoCancel", true);

    manager.notify(NOTIFICATION_ID, plus.android.invoke(builder, "build"));
  } catch (e) {
    console.warn("[useNotification] 显示完成通知失败:", e);
  }
}

/**
 * 清除通知
 */
export function clear() {
  if (!isAndroid()) return;

  try {
    const mainActivity = plus.android.runtimeMainActivity();
    const manager = mainActivity.getSystemService("notification");
    manager.cancel(NOTIFICATION_ID);
  } catch (e) {
    console.warn("[useNotification] 清除通知失败:", e);
  }
}
