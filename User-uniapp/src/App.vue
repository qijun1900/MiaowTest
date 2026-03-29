<!-- ─────────────────────────────────────────────────────────────────────────────
  App.vue — 应用根组件 / 日志 SDK 宿主接入层

  职责：
    1. 在应用生命周期的正确时机初始化 logSDK，确保整个应用的日志能力就绪。
    2. 在前台/后台切换时主动触发补发，减少因网络波动导致的日志积压。
    3. 作为全局异常的最后一道防线，捕获运行时错误与未处理的 Promise 异常并上报。

  协作关系：
    App.vue（宿主）→ logSDK.js（核心引擎）→ logEvents.js（事件契约）
────────────────────────────────────────────────────────────────────────────── -->
<script>
import logSDK from "./util/logSDK";

export default {
    onLaunch: function () {
        // ── 微信云托管初始化 ──────────────────────────────────────────────────────
        // 仅在微信小程序环境下执行（条件编译），初始化微信云开发能力。
        // logSDK 的 requestByCloud 依赖 wx.cloud，必须在 SDK 初始化前完成。
        //#ifdef MP-WEIXIN
        wx.cloud.init();
        //#endif

        // ── 初始化日志 SDK ────────────────────────────────────────────────────────
        // 应用启动时调用一次，内置幂等保护，重复调用无副作用。
        // 初始化流程：
        //   1. 合并自定义配置与默认配置
        //   2. 从本地 Storage 恢复上次未发完的日志队列
        //   3. 监听网络状态，断网恢复时自动触发补发
        //   4. 启动定时补发定时器（每 15s 触发一次）
        //   5. 立即尝试上报存量日志
        logSDK.init({
            batchSize: 20, // 队列积累到 20 条时立即触发上报
            maxRetry: 5, // 单条日志最多重试 5 次，超出后永久丢弃
            flushInterval: 15000, // 定时补发间隔：15 秒
        });

        // ── 记录应用启动事件 ──────────────────────────────────────────────────────
        // 'APP_LAUNCH' 是 logEvents.js 字典中注册的 key，
        // SDK 内部会将其转换为标准 eventName 'app.launch' 再上报。
        logSDK.track("APP_LAUNCH", {
            result: logSDK.results.SUCCESS,
        });

        // ── 检测启动时是否已有登录态（自动登录）────────────────────────────────────
        // 若本地 Storage 中存在 token，说明用户上次已登录且未主动退出，
        // 记录一次 AUTH_AUTO_LOGIN 事件，便于统计用户留存与 token 有效率。
        const existingToken = uni.getStorageSync("token");
        if (existingToken) {
            logSDK.track("AUTH_AUTO_LOGIN", {
                result: logSDK.results.SUCCESS,
            });
        }
    },

    onShow() {
        // ── 应用切回前台 ──────────────────────────────────────────────────────────
        // 触发场景：从后台唤起、锁屏解锁后回到应用等。
        // 主动触发一次补发，将离线或后台期间积压的日志尽快上报。
        logSDK.track("APP_SHOW", {
            result: logSDK.results.SUCCESS,
        });
        logSDK.flush();
    },

    onHide() {
        // ── 应用切入后台 ──────────────────────────────────────────────────────────
        // 触发场景：按 Home 键、切换到其他应用、锁屏等。
        // 在进入后台前尝试上报，降低因进程被系统回收导致日志丢失的概率。
        // 注意：此处不能保证一定发送成功，但结合本地持久化队列，
        //       下次启动时仍可恢复并补发。
        logSDK.track("APP_HIDE", {
            result: logSDK.results.SUCCESS,
        });
        logSDK.flush();
    },

    onError(error) {
        // ── 全局运行时异常捕获 ────────────────────────────────────────────────────
        // 触发场景：组件渲染错误、生命周期函数抛出异常、JS 语法/类型错误等。
        // 将异常对象连同上下文信息一并上报，便于服务端统计错误率与复现问题。
        //
        // context 字段说明：
        //   route      — 标识错误发生的位置（此处为 App 级别）
        //   method     — 标识错误所在的钩子（LIFECYCLE 表示生命周期）
        //   statusCode — 约定 500 表示客户端内部错误
        logSDK.reportError(error, {
            route: "app.onError",
            method: "LIFECYCLE",
            statusCode: 500,
        });
    },

    onUnhandledRejection(event) {
        // ── 全局未捕获 Promise 异常 ───────────────────────────────────────────────
        // 触发场景：异步函数中未被 catch 捕获的 rejected Promise。
        // 例：async 函数内 throw，但调用处没有 try/catch 或 .catch()。
        //
        // event 结构：{ reason: Error | string | any }
        //   reason 是真正的错误原因，优先提取；若不存在则降级使用整个 event。
        //
        // extra 字段：将完整 event 序列化后存入，保留调试所需的原始信息，
        //             便于在服务端查看完整的 rejection 上下文。
        const reason = event?.reason || event;
        logSDK.reportError(reason, {
            route: "app.onUnhandledRejection",
            method: "LIFECYCLE",
            statusCode: 500,
            extra: {
                event:
                    typeof event === "object"
                        ? JSON.stringify(event)
                        : String(event || ""),
            },
        });
    },
};
</script>

<style>
/* ── 全局公共样式 ──────────────────────────────────────────────────────────── */

/* 提升模态框层级，确保 uni-modal 始终覆盖在其他元素之上 */
uni-modal {
    z-index: 19999 !important;
}

/* 全局隐藏滚动条（兼容 WebKit 内核），保持界面整洁 */
::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
}
</style>
