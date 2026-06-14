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
                        name="lock-on"
                        color="#ffffff"
                        size="40"
                    ></t-icon>
                </view>
            </view>
            <text class="title">忘记密码</text>
            <text class="subtitle">通过邮箱验证码重置您的登录密码</text>
        </view>

        <view class="login-form">
            <view class="form-item-wrapper">
                <t-input
                    :value="formData.email"
                    placeholder="请输入注册邮箱"
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
                    placeholder="请设置新密码（至少 6 位）"
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
                    placeholder="请再次确认新密码"
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
                @click="handleReset"
            >确认重置</t-button>

            <view class="register-link">
                <text>想起密码了？</text>
                <text class="link-text" @click="goToLogin">去登录</text>
                <t-icon
                    name="chevron-right"
                    color="var(--app-brand)"
                    size="14"
                ></t-icon>
            </view>
        </view>

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

        <t-message ref="t-message" />
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, getCurrentInstance } from "vue";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import {
    ResetPassword,
    sendEmailVerifyCode,
} from "../../API/My/UserLoginAPI";
import navBarHeightUtil from "../../util/navBarHeight";
import { setMessageInstance, showSuccess, showError } from "../../util/showMessage";

const instance = getCurrentInstance();
const showPassword = ref(true);
const showConfirmPassword = ref(true);
const navBarInfo = ref(0);

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

const formData = reactive({
    email: "",
    verifyCode: "",
    password: "",
    confirmPassword: "",
});

const isCountingDown = ref(false);
const countdown = ref(0);
const countdownTimer = ref(null);

const showCaptcha = ref(false);
const captchaConfig = reactive({
    num1: 0,
    num2: 0,
    answer: "",
});

const captchaQuestion = computed(
    () => `${captchaConfig.num1} + ${captchaConfig.num2} = ?`,
);

const isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email);
});

const verifyBtnText = computed(() =>
    isCountingDown.value ? `${countdown.value}s` : "获取验证码",
);

const canSubmit = computed(
    () =>
        isEmailValid.value &&
        formData.verifyCode &&
        formData.password &&
        formData.confirmPassword,
);

const generateCaptcha = () => {
    captchaConfig.num1 = Math.floor(Math.random() * 10) + 1;
    captchaConfig.num2 = Math.floor(Math.random() * 10) + 1;
    captchaConfig.answer = "";
};

const openCaptcha = () => {
    if (isCountingDown.value || !isEmailValid.value) {
        return;
    }
    generateCaptcha();
    showCaptcha.value = true;
};

const closeCaptcha = () => {
    showCaptcha.value = false;
    captchaConfig.answer = "";
};

const verifyCaptcha = () => {
    const expected = captchaConfig.num1 + captchaConfig.num2;
    if (parseInt(captchaConfig.answer) === expected) {
        closeCaptcha();
        sendVerifyCode();
    } else {
        showError("验证码错误，请重新计算");
        generateCaptcha();
        captchaConfig.answer = "";
    }
};

const sendVerifyCode = async () => {
    if (isCountingDown.value || !isEmailValid.value) {
        return;
    }

    try {
        uni.showLoading({ title: "发送中...", mask: true });
        const result = await sendEmailVerifyCode(formData.email, "reset");
        uni.hideLoading();

        if (result.code === 200) {
            showSuccess("验证码已发送，请查收邮件");
            startCountdown();
        } else {
            showError(result.message || "发送失败，请重试");
        }
    } catch (error) {
        console.error("验证码发送失败:", error);
        uni.hideLoading();
        showError("网络异常，请稍后重试");
    }
};

const handleReset = async () => {
    if (!canSubmit.value) {
        showError("请填写完整信息");
        return;
    }

    if (formData.password.length < 6) {
        showError("密码长度至少为 6 位");
        return;
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
        return;
    }

    try {
        const result = await ResetPassword({
            account: formData.email,
            verifyCode: formData.verifyCode,
            password: formData.password,
        });

        if (result.code === 200) {
            showSuccess(result.message || "重置成功");
            setTimeout(() => {
                uni.redirectTo({
                    url: "/pages/my/UserLoginView",
                });
            }, 1500);
        } else {
            showError(result.message || "重置失败，请稍后重试");
        }
    } catch (error) {
        console.error("重置密码失败:", error);
        showError(error.message || "网络异常，请稍后重试");
    }
};

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

const stopCountdown = () => {
    isCountingDown.value = false;
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
    }
};

const goToLogin = () => {
    uni.navigateBack();
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
            font-size: 28rpx;
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
        font-size: 44rpx;
        font-weight: bold;
        color: var(--app-brand);
        margin-bottom: 10rpx;
    }

    .subtitle {
        font-size: 28rpx;
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
        font-size: 28rpx;
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
            font-size: 34rpx;
            font-weight: bold;
            color: var(--app-text-primary);
            margin-bottom: 10rpx;
        }

        .captcha-subtitle {
            font-size: 26rpx;
            color: var(--app-text-secondary);
            margin-bottom: 30rpx;
            text-align: center;
        }

        .captcha-question {
            font-size: 40rpx;
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
                font-size: 32rpx;
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
