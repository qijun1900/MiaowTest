<template>
    <ThemeProvider>
    <view class="login-container">
        <!-- 自定义 返回按钮 -->
        <view class="back-btn" :style="{ top: backBtnTop }" @click="goBack">
            <t-icon name="chevron-left" color="var(--app-brand)" size="24"></t-icon>
            <text class="back-text">返回</text>
        </view>

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
                    <t-icon
                        name="user"
                        color="#ffffff"
                        size="40"
                    ></t-icon>
                </view>
            </view>
            <text class="title">注册账户</text>
            <text class="subtitle">使用邮箱完成注册，注册后可在"我的"页绑定微信</text>
        </view>

        <view class="login-form">
            <view class="form-item-wrapper">
                <t-input
                    :value="formData.email"
                    placeholder="请输入邮箱地址"
                    prefix-icon="mail"
                    clearable
                    @change="(e) => formData.email = e.value"
                ></t-input>
            </view>

            <view class="form-item-wrapper">
                <view class="verify-wrapper">
                    <view class="verify-input-wrap">
                        <t-input
                            :value="formData.verifyCode"
                            placeholder="请输入验证码"
                            prefix-icon="attach"
                            maxlength="6"
                            @change="(e) => formData.verifyCode = e.value"
                        ></t-input>
                    </view>
                    <t-button
                        :content="verifyBtnText"
                        size="small"
                        theme="primary"
                        class="verify-btn"
                        :disabled="isCountingDown || !isEmailValid"
                        @click="openCaptcha"
                    ></t-button>
                </view>
            </view>

            <view class="form-item-wrapper">
                <t-input
                    :value="formData.password"
                    placeholder="请设置登录密码"
                    prefix-icon="lock-on"
                    :type="showPassword ? 'password' : 'text'"
                    :suffix-icon="formData.password ? (showPassword ? 'browse' : 'browse-off') : ''"
                    @click="(e) => { if (e.trigger === 'suffix-icon') showPassword = !showPassword }"
                    @change="(e) => formData.password = e.value"
                ></t-input>
            </view>

            <view class="form-item-wrapper">
                <t-input
                    :value="formData.confirmPassword"
                    placeholder="请再次确认密码"
                    prefix-icon="lock-on"
                    :type="showConfirmPassword ? 'password' : 'text'"
                    :suffix-icon="formData.confirmPassword ? (showConfirmPassword ? 'browse' : 'browse-off') : ''"
                    @click="(e) => { if (e.trigger === 'suffix-icon') showConfirmPassword = !showConfirmPassword }"
                    @change="(e) => formData.confirmPassword = e.value"
                ></t-input>
            </view>

            <t-button
                theme="primary"
                size="large"
                block
                class="login-btn"
                :disabled="!canSubmit"
                @click="handleRegister"
            >立即注册</t-button>

            <view class="register-link">
                <text>已有账号？</text>
                <text class="link-text" @click="goToLogin">去登录</text>
                <t-icon
                    name="chevron-right"
                    color="var(--app-brand)"
                    size="14"
                ></t-icon>
            </view>
        </view>

        <!-- 底部提示 - 使用通用组件 -->
        <UserAgreementTips
            v-model="agreed"
            @showUserAgreement="showUserAgreement"
            @showPrivacyPolicy="showPrivacyPolicy"
        />

        <t-message ref="t-message" />

        <!-- 人机验证弹窗 -->
        <view class="captcha-modal" v-if="showCaptcha">
            <view class="captcha-mask" @click="closeCaptcha"></view>
            <view class="captcha-content">
                <view class="captcha-title">人机验证</view>
                <view class="captcha-subtitle">请完成下方计算以继续发送验证码</view>
                <view class="captcha-question">{{ captchaQuestion }}</view>
                <view class="captcha-input-wrap">
                    <t-input
                        :value="captchaConfig.answer"
                        placeholder="请输入结果"
                        type="number"
                        clearable
                        :focus="true"
                        @enter="verifyCaptcha"
                        @change="(e) => captchaConfig.answer = e.value"
                    ></t-input>
                </view>
                <view class="captcha-btns">
                    <view class="captcha-btn cancel" @click="closeCaptcha">取消</view>
                    <view class="captcha-btn confirm" @click="verifyCaptcha">确认</view>
                </view>
            </view>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, getCurrentInstance } from "vue";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import {
    UserRegister,
    sendEmailVerifyCode,
} from "../../API/My/UserLoginAPI";
import { wechatBind } from "../../util/auth/wechatLogin";
import navBarHeightUtil from "../../util/ui/navBar";
import UserAgreementTips from "../../components/modules/my/UserAgreementTips.vue";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import logSDK from "../../util/log/sdk";
import { setMessageInstance, showSuccess, showError, showWarning } from "../../util/ui/message";

const instance = getCurrentInstance();
const AGREED_KEY = "user_agreed_policy";
const showPassword = ref(true);
const showConfirmPassword = ref(true);
const agreed = ref(uni.getStorageSync(AGREED_KEY) || false);

watch(agreed, (val) => {
    uni.setStorageSync(AGREED_KEY, val);
});
const navBarInfo = ref(0);
const userInfoStore = UserInfoStore();

// 计算返回按钮的top位置
const backBtnTop = computed(() => {
    return navBarInfo.value ? navBarInfo.value + "rpx" : "75rpx";
});

// 返回上一页
const goBack = () => {
    uni.navigateBack({
        fail: () => {
            uni.switchTab({ url: "/pages/tab/my" });
        }
    });
};

// 表单数据
const formData = reactive({
    email: "",
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
    captchaConfig.num1 = Math.floor(Math.random() * 10) + 1;
    captchaConfig.num2 = Math.floor(Math.random() * 10) + 1;
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
        closeCaptcha();
        sendVerifyCode();
    } else {
        showError("验证码错误，请重新计算");
        generateCaptcha();
        captchaConfig.answer = '';
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

// 是否可以提交表单
const canSubmit = computed(() => {
    return (
        formData.email &&
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

// 发送验证码
const sendVerifyCode = async () => {
    if (isCountingDown.value || !isEmailValid.value) {
        return;
    }

    try {
        uni.showLoading({
            title: "发送中...", mask: true
        });

        const result = await sendEmailVerifyCode(formData.email, "register");

        uni.hideLoading();

        if (result.code === 200) {
            showSuccess("验证码已发送，请查收邮件");
            startCountdown();
            logSDK.track("AUTH_LOGIN_SEND_VERIFY_CODE", {
                result: logSDK.results.SUCCESS,
            });
        } else {
            showError(result.message || "发送失败，请重试");
            logSDK.track("AUTH_LOGIN_SEND_VERIFY_CODE", {
                result: logSDK.results.FAIL,
                errorCode: String(result.code || ""),
                errorMessage: result.message || "发送验证码失败",
            });
        }
    } catch (error) {
        console.error("验证码发送失败:", error);
        uni.hideLoading();
        showError("网络异常，请稍后重试");
    }
};

// 注册成功后调用 wx.login 拿 code，再请求后端绑定微信
const bindWechatAfterRegister = async () => {
    // 仅微信小程序支持 wx.login，App 端目前不在此处提供原生微信授权
    // #ifdef MP-WEIXIN
    try {
        await wechatBind();
    } catch (e) {
        console.error("BindWechat 异常:", e);
    }
    // #endif
    // #ifndef MP-WEIXIN
    showWarning("请在微信小程序内完成绑定");
    // #endif
};

// 注册成功后弹窗：是否立即绑定微信
const promptBindWechat = () => {
    return new Promise((resolve) => {
        // #ifdef MP-WEIXIN
        uni.showModal({
            title: "绑定微信",
            content: "绑定后可使用微信一键登录，下次无需输入账号密码。",
            confirmText: "立即绑定",
            cancelText: "稍后再说",
            success: (res) => {
                if (res.confirm) {
                    bindWechatAfterRegister();
                }
                resolve();
            },
            fail: () => resolve(),
        });
        // #endif
        // #ifndef MP-WEIXIN
        // App / H5 端：注册完成后直接进入主页面，可在"我的"页随时绑定
        uni.showModal({
            title: "注册成功",
            showCancel: false,
            confirmText: "知道了",
            success: () => resolve(),
            fail: () => resolve(),
        });
        // #endif
    });
};

// 处理注册
const handleRegister = async () => {
    if (!canSubmit.value) {
        showWarning("请填写完整信息");
        return;
    }
    if (!agreed.value) {
        showWarning("请先阅读并同意用户协议和隐私政策");
        return;
    }

    try {

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

        const result = await UserRegister({
            account: formData.email,
            verifyCode: formData.verifyCode,
            password: formData.password,
        });

        if (result.code === 200) {
            // 后端注册成功后已下发 token + userInfo，直接进入登录态
            if (result.data?.token) {
                uni.setStorageSync("token", result.data.token);
            }
            if (result.data?.userInfo) {
                userInfoStore.setUserInfo(result.data.userInfo);
            }

            showSuccess(result.message || "注册成功");

            logSDK.track("AUTH_REGISTER", {
                result: logSDK.results.SUCCESS,
                metadata: { mode: "register" },
            });

            // 短暂延时确保 toast 可见，再弹绑定微信引导
            setTimeout(async () => {
                await promptBindWechat();
                // 不论是否绑定，都返回上一页（通常是登录页或"我的"）
                const pages = getCurrentPages();
                if (pages.length > 1) {
                    uni.navigateBack();
                } else {
                    uni.switchTab({ url: "/pages/my/MyView" });
                }
            }, 1200);
        } else {
            logSDK.track("AUTH_REGISTER", {
                result: logSDK.results.FAIL,
                errorCode: String(result.code || ""),
                errorMessage: result.message || "注册失败，请稍后重试",
                metadata: { mode: "register" },
            });
            showError(result.message || "注册失败");
        }
    } catch (error) {
        console.error("注册异常:", error);
        const errorMsg = error.message || "网络异常，请稍后重试";
        showError(errorMsg);
        logSDK.track("AUTH_REGISTER", {
            result: logSDK.results.FAIL,
            errorMessage: errorMsg,
            metadata: { mode: "register" },
        });
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

onMounted(() => {
    const info = navBarHeightUtil.getNavBarInfo();
    navBarInfo.value = info.totalHeight;
    setMessageInstance(instance.proxy);
});

onUnmounted(() => {
    stopCountdown();
});
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: var(--app-brand-light);
    padding: 12rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    // 返回按钮样式
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
            font-size: calc(28rpx * var(--app-font-scale, 1));
            color: var(--app-brand);
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
    margin-top: 60rpx;
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
            background-color: var(--app-brand);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4rpx 10rpx rgba(60, 156, 255, 0.3);
        }
    }

    .title {
        font-size: calc(44rpx * var(--app-font-scale, 1));
        font-weight: bold;
        color: var(--app-brand);
        margin-bottom: 10rpx;
    }

    .subtitle {
        font-size: calc(28rpx * var(--app-font-scale, 1));
        color: var(--app-text-secondary);
    }
}

.login-form {
    background-color: var(--app-bg-container);
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 30rpx rgba(60, 156, 255, 0.1);
    position: relative;
    z-index: 1;

    .form-item-wrapper {
        margin-bottom: 24rpx;
    }

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

    .login-btn {
        margin-top: 10rpx;
    }

    .register-link {
        text-align: center;
        margin-top: 40rpx;
        font-size: calc(28rpx * var(--app-font-scale, 1));
        color: var(--app-text-secondary);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6rpx;

        .link-text {
            color: var(--app-brand);
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
        background-color: var(--app-bg-container);
        border-radius: 20rpx;
        padding: 40rpx 40rpx 20rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);

        .captcha-title {
            font-size: calc(34rpx * var(--app-font-scale, 1));
            font-weight: bold;
            color: var(--app-text-primary);
            margin-bottom: 10rpx;
        }

        .captcha-subtitle {
            font-size: calc(26rpx * var(--app-font-scale, 1));
            color: var(--app-text-secondary);
            margin-bottom: 30rpx;
            text-align: center;
        }

        .captcha-question {
            font-size: calc(40rpx * var(--app-font-scale, 1));
            font-weight: bold;
            color: var(--app-brand);
            margin: 20rpx 0 30rpx;
            background: var(--app-brand-light);
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
                font-size: calc(32rpx * var(--app-font-scale, 1));
                text-align: center;
                padding: 30rpx 0;
                transition: background-color 0.2s;

                &:active {
                    background-color: var(--app-bg-secondary);
                }

                &.cancel {
                    color: var(--app-text-secondary);
                    border-right: 1rpx solid #eee;
                }

                &.confirm {
                    color: var(--app-brand);
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
