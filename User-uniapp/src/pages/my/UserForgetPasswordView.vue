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
                        name="lock"
                        color="#ffffff"
                        size="40"
                    ></u-icon>
                </view>
            </view>
            <text class="title">忘记密码</text>
            <text class="subtitle">通过邮箱验证码重置您的登录密码</text>
        </view>

        <view class="login-form">
            <u-form :model="formData" ref="uForm">
                <!-- 邮箱输入 -->
                <u-form-item prop="email">
                    <u-input
                        v-model="formData.email"
                        placeholder="请输入注册邮箱"
                        prefixIcon="email"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        clearable
                    ></u-input>
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

                <!-- 新密码 -->
                <u-form-item prop="password">
                    <u-input
                        v-model="formData.password"
                        placeholder="请设置新密码（至少 6 位）"
                        prefixIcon="lock-open"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        :password="showPassword"
                    ></u-input>
                </u-form-item>

                <!-- 确认新密码 -->
                <u-form-item prop="confirmPassword">
                    <u-input
                        v-model="formData.confirmPassword"
                        placeholder="请再次确认新密码"
                        prefixIcon="lock"
                        prefixIconStyle="font-size: 22px;color: #909399"
                        :password="showConfirmPassword"
                    ></u-input>
                </u-form-item>

                <u-button
                    type="primary"
                    class="login-btn"
                    :disabled="!canSubmit"
                    @click="handleReset"
                >
                    <u-icon
                        name="checkmark"
                        color="#ffffff"
                        size="18"
                    ></u-icon>
                    <text class="btn-text">确认重置</text>
                </u-button>

                <view class="register-link">
                    <text>想起密码了？</text>
                    <text class="link-text" @click="goToLogin">去登录</text>
                    <u-icon
                        name="arrow-rightward"
                        color="#3c9cff"
                        size="14"
                    ></u-icon>
                </view>
            </u-form>
        </view>

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
import { ref, reactive, computed, onUnmounted } from "vue";
import {
    ResetPassword,
    sendEmailVerifyCode,
} from "../../API/My/UserLoginAPI";

const showPassword = ref(true);
const showConfirmPassword = ref(true);

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
        uni.showToast({
            title: "验证码错误，请重新计算",
            icon: "none",
            duration: 2000,
            position: "bottom",
        });
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
            uni.showToast({
                title: "验证码已发送，请查收邮件",
                icon: "success",
                duration: 2500,
                position: "bottom",
            });
            startCountdown();
        } else {
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

const handleReset = async () => {
    if (!canSubmit.value) {
        uni.showToast({
            title: "请填写完整信息",
            icon: "none",
            duration: 2000,
        });
        return;
    }

    if (formData.password.length < 6) {
        uni.showToast({
            title: "密码长度至少为 6 位",
            icon: "none",
            duration: 2000,
        });
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
            uni.showToast({
                title: result.message || "重置成功",
                duration: 2000,
                position: "bottom",
            });
            setTimeout(() => {
                uni.redirectTo({
                    url: "/pages/my/UserLoginView",
                });
            }, 1500);
        } else {
            uni.showToast({
                title: result.message || "重置失败，请稍后重试",
                icon: "none",
                duration: 2500,
                position: "bottom",
            });
        }
    } catch (error) {
        console.error("重置密码失败:", error);
        uni.showToast({
            title: error.message || "网络异常，请稍后重试",
            icon: "none",
            duration: 2000,
        });
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
