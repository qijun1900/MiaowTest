<template>
    <view class="login-container">
        <!-- 装饰性背景元素 -->
        <view class="bg-decoration top-left"></view>
        <view class="bg-decoration top-right"></view>
        <view class="bg-decoration bottom-left"></view>

        <view class="login-header">
            <view class="logo-container">
                <image
                    class="logo"
                    src="/static/other/login-cat.png"
                    mode="aspectFit"
                ></image>
                <view class="logo-bg">
                    <u-icon
                        name="account-fill"
                        color="#ffffff"
                        size="40"
                    ></u-icon>
                </view>
            </view>
            <text class="title">{{ bindMode ? "绑定账号" : "注册账户" }}</text>
            <text class="subtitle">{{
                bindMode ? "请输入您的账号完成绑定" : "请输入您的邮箱完成注册"
            }}</text>
        </view>

        <view class="login-form">
            <u-form :model="formData" ref="uForm">
                <!-- 邮箱输入 -->
                <u-form-item prop="email">
                    <u-input
                        v-model="formData.email"
                        placeholder="请输入邮箱地址"
                        prefixIcon="email"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        clearable
                    ></u-input>
                </u-form-item>

                <!-- UID输入 -->
                <u-form-item prop="uid">
                    <view class="uid-wrapper">
                        <view class="uid-input-wrap">
                            <u-input
                                v-model="formData.uid"
                                placeholder="请输入用户UID"
                                prefixIcon="account"
                                prefixIconStyle="font-size: 22px;color: #909399"
                                clearable
                            ></u-input>
                        </view>
                        <u-button
                            text="获取UID"
                            size="small"
                            type="primary"
                            class="uid-btn"
                            @click="handleGetUid"
                        ></u-button>
                    </view>
                </u-form-item>

                <!-- 验证码输入 -->
                <u-form-item prop="verifyCode">
                    <view class="verify-wrapper">
                        <view class="verify-input-wrap">
                            <u-input
                                v-model="formData.verifyCode"
                                placeholder="请输入验证码"
                                prefixIcon="attach"
                                prefixIconStyle="font-size: 22px;color: #909399"
                                maxlength="6"
                            ></u-input>
                        </view>
                        <u-button
                            :text="verifyBtnText"
                            size="small"
                            type="primary"
                            class="verify-btn"
                            :disabled="isCountingDown || !isEmailValid"
                            @click="openCaptcha"
                        ></u-button>
                    </view>
                </u-form-item>

                <!-- 密码输入 -->
                <u-form-item prop="password">
                    <u-input
                        v-model="formData.password"
                        placeholder="请设置登录密码"
                        prefixIcon="lock-open"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        :password="showPassword"
                    ></u-input>
                </u-form-item>

                <!-- 确认密码输入 -->
                <u-form-item prop="confirmPassword">
                    <u-input
                        v-model="formData.confirmPassword"
                        placeholder="请再次确认密码"
                        prefixIcon="lock"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        :password="showConfirmPassword"
                    ></u-input>
                </u-form-item>

                <u-button
                    type="primary"
                    class="login-btn"
                    :disabled="!canSubmit"
                    @click="handleLogin"
                >
                    <u-icon
                        name="arrow-rightward"
                        color="#ffffff"
                        size="18"
                    ></u-icon>
                    <text class="btn-text">{{
                        bindMode ? "立即绑定" : "立即注册"
                    }}</text>
                </u-button>

                <view class="register-link">
                    <text>已有账号？</text>
                    <text class="link-text" @click="goToLogin">去登录</text>
                    <u-icon
                        name="arrow-rightward"
                        color="#3c9cff"
                        size="14"
                    ></u-icon>
                </view>
            </u-form>
        </view>

        <!-- 底部提示 - 使用通用组件 -->
        <UserAgreementTips
            v-model="agreed"
            @showUserAgreement="showUserAgreement"
            @showPrivacyPolicy="showPrivacyPolicy"
        />

        <!-- 人机验证弹窗 -->
        <view class="captcha-modal" v-if="showCaptcha">
            <view class="captcha-mask" @click="closeCaptcha"></view>
            <view class="captcha-content">
                <view class="captcha-title">人机验证</view>
                <view class="captcha-subtitle">请完成下方计算以继续发送验证码</view>
                <view class="captcha-question">{{ captchaQuestion }}</view>
                <view class="captcha-input-wrap">
                    <u-input
                        v-model="captchaConfig.answer"
                        placeholder="请输入结果"
                        type="number"
                        border="surround"
                        clearable
                        focus
                        @confirm="verifyCaptcha"
                    ></u-input>
                </view>
                <view class="captcha-btns">
                    <view class="captcha-btn cancel" @click="closeCaptcha">取消</view>
                    <view class="captcha-btn confirm" @click="verifyCaptcha">确认</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
    UserRegister,
    BindAccount,
    sendEmailVerifyCode,
} from "../../API/My/UserLoginAPI";
import navBarHeightUtil from "../../util/navBarHeight";
import UserAgreementTips from "../../components/modules/my/UserAgreementTips.vue";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import logSDK from "../../util/logSDK";

// 绑定模式状态
const bindMode = ref(false);
const showPassword = ref(true);
const showConfirmPassword = ref(true);
const agreed = ref(false);
const navBarInfo = ref(0);
const isAppPlatform = ref(false);
const userInfoStore = UserInfoStore();

// 表单数据
const formData = reactive({
    email: "",
    uid: "",
    verifyCode: "",
    password: "",
    confirmPassword: "",
});

// 验证码相关状态
const isCountingDown = ref(false);
const countdown = ref(0);
const countdownTimer = ref(null);

// 人机验证相关状态
const showCaptcha = ref(false);
const captchaConfig = reactive({
    num1: 0,
    num2: 0,
    answer: '',
});

const captchaQuestion = computed(() => `${captchaConfig.num1} + ${captchaConfig.num2} = ?`);

const generateCaptcha = () => {
    captchaConfig.num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    captchaConfig.num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    captchaConfig.answer = '';
};

const openCaptcha = () => {
    if (isCountingDown.value || !isEmailValid.value || !formData.email) {
        return;
    }
    generateCaptcha();
    showCaptcha.value = true;
};

const closeCaptcha = () => {
    showCaptcha.value = false;
    captchaConfig.answer = '';
};

const verifyCaptcha = () => {
    const expected = captchaConfig.num1 + captchaConfig.num2;
    if (parseInt(captchaConfig.answer) === expected) {
        // 验证通过
        closeCaptcha();
        sendVerifyCode();
    } else {
        uni.showToast({
            title: "验证码错误，请重新计算",
            icon: "none",
            duration: 2000,
            position: "bottom"
        });
        generateCaptcha(); // 错误后重新生成新题目
        captchaConfig.answer = ''; // 清空输入
    }
};

// 邮箱验证
const isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email);
});

// 验证码按钮文本
const verifyBtnText = computed(() => {
    if (isCountingDown.value) {
        return `${countdown.value}s`;
    }
    return "获取验证码";
});

const isUidRequired = computed(() => isAppPlatform.value);

// 是否可以提交表单
const canSubmit = computed(() => {
    return (
        formData.email &&
        (!isUidRequired.value || formData.uid.trim()) &&
        formData.verifyCode &&
        formData.password &&
        formData.confirmPassword
    );
});

// 跳转登录页
const goToLogin = () => {
    uni.navigateTo({
        url: "/pages/my/UserLoginView",
    });
};

const getLocalUid = () => {
    // 优先从当前用户状态读取
    if (userInfoStore.userInfo?.uid) {
        return String(userInfoStore.userInfo.uid).trim();
    }

    // 兜底从本地持久化读取
    const cachedUserInfo = uni.getStorageSync("userinfo");
    let parsedUserInfo = cachedUserInfo;

    if (typeof cachedUserInfo === "string") {
        try {
            parsedUserInfo = JSON.parse(cachedUserInfo);
        } catch {
            parsedUserInfo = null;
        }
    }

    const uid = parsedUserInfo?.uid || parsedUserInfo?.userInfo?.uid;
    return uid ? String(uid).trim() : "";
};

// 获取UID（按平台处理）
const handleGetUid = async () => {
    try {
        const platform = uni.getSystemInfoSync().uniPlatform;
        if (platform === "mp-weixin") {
            const localUid = getLocalUid();
            if (!localUid) {
                uni.showToast({
                    title: "本地未找到UID，请先登录后重试",
                    icon: "none",
                    duration: 2000,
                });
                return;
            }
            formData.uid = localUid;
            uni.showToast({
                title: "已从本地填入UID",
                icon: "success",
                duration: 1500,
            });
            return;
        }

        if (platform === "app") {
            uni.showModal({
                title: "前往微信获取UID",
                content:
                    "将为你拉起微信，请在微信小程序中搜索“题喵喵”获取UID。",
                confirmText: "去微信",
                success: (res) => {
                    if (!res.confirm) return;

                    uni.setClipboardData({
                        data: "题喵喵",
                        success: () => {
                            uni.showToast({
                                title: "已复制“题喵喵”到剪贴板",
                                icon: "none",
                                duration: 1800,
                            });
                        },
                    });

                    if (
                        typeof plus !== "undefined" &&
                        plus.runtime &&
                        typeof plus.runtime.launchApplication === "function"
                    ) {
                        plus.runtime.launchApplication(
                            { pname: "com.tencent.mm" },
                            () => {
                                uni.showToast({
                                    title: "未检测到微信客户端",
                                    icon: "none",
                                    duration: 2000,
                                });
                            },
                        );
                    } else {
                        uni.showToast({
                            title: "当前环境不支持拉起微信",
                            icon: "none",
                            duration: 2000,
                        });
                    }
                },
            });
            return;
        }

        // 其他平台兜底：从剪贴板读取
        const res = await uni.getClipboardData();
        const uid = (res?.data || "").toString().trim();

        if (!uid) {
            uni.showToast({
                title: "剪贴板为空，请先复制UID",
                icon: "none",
                duration: 2000,
            });
            return;
        }

        formData.uid = uid;
        uni.showToast({
            title: "UID已填入",
            icon: "success",
            duration: 1500,
        });
    } catch (error) {
        console.error("获取UID失败:", error);
        uni.showToast({
            title: "获取失败，请手动输入",
            icon: "none",
            duration: 2000,
        });
    }
};

// 发送验证码
const sendVerifyCode = async () => {
    if (isCountingDown.value || !isEmailValid.value) {
        return;
    }

    try {
        uni.showLoading({ title: "发送中...", mask: true });

        const result = await sendEmailVerifyCode(formData.email);

        uni.hideLoading();

        if (result.code === 200) {
            uni.showToast({
                title: "验证码已发送，请查收邮件",
                icon: "success",
                duration: 2500,
                position: "bottom",
            });
            startCountdown();
        } else {
            // 频率限制或其他业务错误
            uni.showToast({
                title: result.message || "发送失败，请重试",
                icon: "none",
                duration: 3000,
                position: "bottom",
            });
        }
    } catch (error) {
        console.error("验证码发送失败:", error);
        uni.hideLoading();
        uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none",
            duration: 2000,
            position: "bottom",
        });
    }
};

// 处理注册/绑定
const handleLogin = async () => {
    if (!agreed.value) {
        uni.showToast({
            title: "请先阅读并同意用户协议和隐私政策",
            icon: "none",
            duration: 2000,
        });
        return;
    }

    try {
        if (!canSubmit.value) {
            uni.showToast({
                title: "请填写完整信息",
                icon: "none",
                duration: 2000,
            });
            throw new Error("表单填写不完整");
        }

        if (isUidRequired.value && !formData.uid.trim()) {
            uni.showToast({
                title: "App端请先填写UID",
                icon: "none",
                duration: 2000,
            });
            throw new Error("App端UID必填");
        }

        if (formData.password !== formData.confirmPassword) {
            await new Promise((resolve) => {
                uni.showModal({
                    title: "密码不一致",
                    content: "两次输入的密码不一致，请重新输入",
                    showCancel: false,
                    success: () => {
                        formData.password = "";
                        formData.confirmPassword = "";
                        resolve();
                    },
                });
            });
            throw new Error("密码不一致");
        }

        let result;
        if (bindMode.value) {
            result = await BindAccount({
                account: formData.email,
                uid: formData.uid,
                verifyCode: formData.verifyCode,
                password: formData.password,
            });
        } else {
            result = await UserRegister({
                account: formData.email,
                uid: formData.uid,
                verifyCode: formData.verifyCode,
                password: formData.password,
            });
        }

        if (result.code === 200) {
            uni.showToast({
                title: result.message,
                icon: "success",
                duration: 2000,
            });

            // 埋点：注册 / 绑定账号成功
            logSDK.track("AUTH_REGISTER", {
                result: logSDK.results.SUCCESS,
                metadata: { mode: bindMode.value ? "bind" : "register" },
            });

            if (bindMode.value) {
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } else {
                setTimeout(() => {
                    uni.navigateTo({ url: "/pages/my/UserLoginView" });
                }, 1500);
            }
        } else {
            // 埋点：注册 / 绑定账号业务失败（服务端返回非 200）
            logSDK.track("AUTH_REGISTER", {
                result: logSDK.results.FAIL,
                errorCode: String(result.code || ""),
                errorMessage: result.message || "注册失败，请稍后重试",
                metadata: { mode: bindMode.value ? "bind" : "register" },
            });
        }
    } catch (error) {
        console.error(bindMode.value ? "绑定异常:" : "注册异常:", error);
        const errorMsg = error.message || "网络异常，请稍后重试";
        uni.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2000,
        });
        // 埋点：注册 / 绑定账号异常（表单校验失败或网络错误）
        // 注意：表单校验类错误（密码不一致、字段缺失）也会走到此处，
        //       通过 errorMessage 区分具体原因。
        logSDK.track("AUTH_REGISTER", {
            result: logSDK.results.FAIL,
            errorMessage: errorMsg,
            metadata: { mode: bindMode.value ? "bind" : "register" },
        });
        throw error;
    }
};

// 开始倒计时
const startCountdown = () => {
    isCountingDown.value = true;
    countdown.value = 60;

    countdownTimer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            stopCountdown();
        }
    }, 1000);
};

// 停止倒计时
const stopCountdown = () => {
    isCountingDown.value = false;
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
    }
};

// 用户服务协议
const showUserAgreement = () => {
    uni.navigateTo({
        url: "/pages/public/UserAgreementView",
    });
};

// 隐私政策
const showPrivacyPolicy = () => {
    uni.navigateTo({
        url: "/pages/public/PrivacyPolicyView",
    });
};

onLoad((options) => {
    if (options.isBind === "true") {
        bindMode.value = true;
    }

    const platform = uni.getSystemInfoSync().uniPlatform;
    isAppPlatform.value = platform === "app";
});

onMounted(() => {
    const info = navBarHeightUtil.getNavBarInfo();
    navBarInfo.value = info.totalHeight;
});

onUnmounted(() => {
    stopCountdown();
});
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: #f5f9ff;
    padding: 12rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    .back-btn {
        position: absolute;
        left: 20rpx;
        display: flex;
        align-items: center;
        gap: 10rpx;
        z-index: 10;
        padding: 10rpx 20rpx;
        border-radius: 20rpx;
        background-color: rgba(255, 255, 255, 0.8);

        .back-text {
            font-size: 28rpx;
            color: #3c9cff;
        }
    }

    .bg-decoration {
        position: absolute;
        border-radius: 50%;
        z-index: 0;

        &.top-left {
            width: 200rpx;
            height: 200rpx;
            background: linear-gradient(
                135deg,
                rgba(60, 156, 255, 0.1),
                rgba(60, 156, 255, 0.05)
            );
            top: -50rpx;
            left: -50rpx;
        }

        &.top-right {
            width: 150rpx;
            height: 150rpx;
            background: linear-gradient(
                135deg,
                rgba(60, 156, 255, 0.08),
                rgba(60, 156, 255, 0.03)
            );
            top: 100rpx;
            right: -30rpx;
        }

        &.bottom-left {
            width: 180rpx;
            height: 180rpx;
            background: linear-gradient(
                135deg,
                rgba(60, 156, 255, 0.06),
                rgba(60, 156, 255, 0.02)
            );
            bottom: 100rpx;
            left: -40rpx;
        }
    }
}

.login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24rpx;
    margin-bottom: 60rpx;
    position: relative;
    z-index: 1;

    .logo-container {
        position: relative;
        margin-bottom: 30rpx;

        .logo {
            width: 160rpx;
            height: 160rpx;
            border-radius: 30rpx;
            box-shadow: 0 10rpx 30rpx rgba(60, 156, 255, 0.2);
        }

        .logo-bg {
            position: absolute;
            bottom: -10rpx;
            right: -10rpx;
            width: 60rpx;
            height: 60rpx;
            background-color: #3c9cff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4rpx 10rpx rgba(60, 156, 255, 0.3);
        }
    }

    .title {
        font-size: 44rpx;
        font-weight: bold;
        color: #3c9cff;
        margin-bottom: 10rpx;
    }

    .subtitle {
        font-size: 28rpx;
        color: #909193;
    }
}

.login-form {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 30rpx rgba(60, 156, 255, 0.1);
    position: relative;
    z-index: 1;

    .verify-wrapper {
        display: flex;
        align-items: center;
        width: 100%;

        .verify-input-wrap {
            flex: 1;
            min-width: 0;
        }

        .verify-btn {
            margin-left: 20rpx;
            flex-shrink: 0;
            width: 200rpx;
        }
    }

    .uid-wrapper {
        display: flex;
        align-items: center;
        width: 100%;

        .uid-input-wrap {
            flex: 1;
            min-width: 0;
        }

        .uid-btn {
            margin-left: 20rpx;
            flex-shrink: 0;
            width: 200rpx;
        }
    }

    .login-btn {
        width: 100%;
        height: 90rpx;
        margin-top: 30rpx;
        background-color: #3c9cff;
        border-radius: 45rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10rpx;

        .btn-text {
            color: #ffffff;
            font-size: 32rpx;
            font-weight: bold;
        }
    }

    .register-link {
        text-align: center;
        margin-top: 40rpx;
        font-size: 28rpx;
        color: #909193;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6rpx;

        .link-text {
            color: #3c9cff;
        }
    }
}

/* 人机验证弹窗样式 */
.captcha-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;

    .captcha-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }

    .captcha-content {
        width: 80%;
        background-color: #fff;
        border-radius: 20rpx;
        padding: 40rpx 40rpx 20rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);

        .captcha-title {
            font-size: 34rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 10rpx;
        }
        
        .captcha-subtitle {
            font-size: 26rpx;
            color: #909399;
            margin-bottom: 30rpx;
            text-align: center;
        }

        .captcha-question {
            font-size: 40rpx;
            font-weight: bold;
            color: #3c9cff;
            margin: 20rpx 0 30rpx;
            background: #f5f9ff;
            padding: 20rpx 40rpx;
            border-radius: 12rpx;
            letter-spacing: 2rpx;
        }

        .captcha-input-wrap {
            width: 100%;
            margin-bottom: 40rpx;
        }

        .captcha-btns {
            width: 100%;
            display: flex;
            border-top: 1rpx solid #eee;

            .captcha-btn {
                flex: 1;
                font-size: 32rpx;
                text-align: center;
                padding: 30rpx 0;
                transition: background-color 0.2s;

                &:active {
                    background-color: #f5f5f5;
                }

                &.cancel {
                    color: #909399;
                    border-right: 1rpx solid #eee;
                }

                &.confirm {
                    color: #3c9cff;
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
