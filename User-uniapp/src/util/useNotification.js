const CHANNEL_ID = "app_update";
const CHANNEL_NAME = "应用更新";
const NOTIFICATION_ID = 1001;
const TAG = "[useNotification]";

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
  console.log(`${TAG} ensureInit: plus=${hasPlus}, plus.android=${hasAndroid}`);
  if (!hasPlus || !hasAndroid) return false;

  try {
    // 延迟导入原生类 —— 模块加载时 plus 可能还没就绪
    if (!NotificationManager) {
      NotificationManager = plus.android.importClass("android.app.NotificationManager");
      console.log(`${TAG} importClass NotificationManager:`, NotificationManager);
    }
    if (!NotificationChannel) {
      NotificationChannel = plus.android.importClass("android.app.NotificationChannel");
      console.log(`${TAG} importClass NotificationChannel:`, NotificationChannel);
    }
    if (!Notification) {
      Notification = plus.android.importClass("android.app.Notification");
      console.log(`${TAG} importClass Notification:`, Notification);
    }

    const mainActivity = plus.android.runtimeMainActivity();
    console.log(`${TAG} mainActivity:`, mainActivity);
    cachedManager = mainActivity.getSystemService("notification");
    console.log(`${TAG} cachedManager:`, cachedManager);

    // 解析小图标资源 ID —— getApplicationInfo().icon 在 bridge 中返回 undefined
    // 先 importClass 让 bridge 识别 Java 对象类型，再调方法
    const Resources = plus.android.importClass("android.content.res.Resources");
    console.log(`${TAG} importClass Resources:`, !!Resources);
    const res = mainActivity.getResources();
    const pkgName = mainActivity.getPackageName();
    cachedIcon = res.getIdentifier("ic_launcher", "mipmap", pkgName)
      || res.getIdentifier("ic_launcher", "drawable", pkgName)
      || res.getIdentifier("ic_notification", "drawable", pkgName);
    console.log(`${TAG} cachedIcon getIdentifier 结果:`, cachedIcon);
    // 应用图标找不到时，用系统内置 drawable
    if (!cachedIcon) {
      try {
        const RDrawable = plus.android.importClass("android.R$drawable");
        cachedIcon = RDrawable.ic_dialog_info || RDrawable.ic_menu_info_details;
        console.log(`${TAG} cachedIcon 系统回退:`, cachedIcon);
      } catch (re) {
        console.error(`${TAG} R$drawable 回退也失败:`, re.message);
      }
    }
    console.log(`${TAG} cachedIcon 最终值:`, cachedIcon);

    // 创建通知渠道（Android 8+）
    if (!channelCreated) {
      const channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
      channel.setShowBadge(false);
      cachedManager.createNotificationChannel(channel);
      channelCreated = true;
      console.log(`${TAG} 通知渠道创建成功`);
    }
    return true;
  } catch (e) {
    console.error(`${TAG} 初始化失败:`, e.message, e.stack);
    return false;
  }
}

/**
 * 显示带进度条的通知
 * @param {string} title - 通知标题
 * @param {number} progress - 进度 0~100
 */
export function showProgress(title, progress) {
  console.log(`${TAG} showProgress called: title=${title}, progress=${progress}, isAndroid=${isAndroid()}`);
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) {
      console.warn(`${TAG} showProgress: ensureInit 失败，跳过`);
      return;
    }
    try {
      const mainActivity = plus.android.runtimeMainActivity();
      const builder = new Notification.Builder(mainActivity, CHANNEL_ID);
      builder.setSmallIcon(cachedIcon);
      builder.setContentTitle(title);
      builder.setContentText(progress + "%");
      builder.setProgress(100, progress, false);
      builder.setOngoing(true);
      builder.setOnlyAlertOnce(true);
      const notification = builder.build();
      console.log(`${TAG} notification 对象:`, notification);
      cachedManager.notify(NOTIFICATION_ID, notification);
      console.log(`${TAG} notify() 调用成功, progress=${progress}%`);
    } catch (e) {
      console.error(`${TAG} 更新进度通知失败:`, e.message, e.stack);
    }
  }, 0);
}

/**
 * 显示完成通知（无进度条）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
export function showComplete(title, message) {
  console.log(`${TAG} showComplete called: title=${title}, message=${message}, isAndroid=${isAndroid()}`);
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) {
      console.warn(`${TAG} showComplete: ensureInit 失败，跳过`);
      return;
    }
    try {
      const mainActivity = plus.android.runtimeMainActivity();
      const builder = new Notification.Builder(mainActivity, CHANNEL_ID);
      builder.setSmallIcon(cachedIcon);
      builder.setContentTitle(title);
      builder.setContentText(message);
      builder.setAutoCancel(true);
      cachedManager.notify(NOTIFICATION_ID, builder.build());
      console.log(`${TAG} 完成通知显示成功`);
    } catch (e) {
      console.error(`${TAG} 显示完成通知失败:`, e.message, e.stack);
    }
  }, 0);
}

/**
 * 清除通知
 */
export function clear() {
  console.log(`${TAG} clear called, isAndroid=${isAndroid()}`);
  if (!isAndroid()) return;
  setTimeout(() => {
    if (!ensureInit()) return;
    try {
      cachedManager.cancel(NOTIFICATION_ID);
      console.log(`${TAG} 通知清除成功`);
    } catch (e) {
      console.error(`${TAG} 清除通知失败:`, e.message, e.stack);
    }
  }, 0);
}
