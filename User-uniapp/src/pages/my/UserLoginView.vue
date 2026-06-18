<template>
    <ThemeProvider>
    <view class="login-container">
        <!-- 自定义 添加返回按钮 -->
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
            <text class="title">用户登录</text>
            <text class="subtitle">欢迎回来，请登录您的账号</text>
        </view>

        <view class="login-form">
            <view class="form-item-wrapper">
                <t-input
                    :value="formData.email"
                    placeholder="请输入邮箱"
                    prefix-icon="mail"
                    clearable
                    @change="(e) => formData.email = e.value"
                ></t-input>
            </view>

            <view class="form-item-wrapper">
                <t-input
                    :value="formData.password"
                    placeholder="请输入密码"
                    prefix-icon="lock-on"
                    :type="showPassword ? 'password' : 'text'"
                    :suffix-icon="formData.password ? (showPassword ? 'browse' : 'browse-off') : ''"
                    @click="(e) => { if (e.trigger === 'suffix-icon') showPassword = !showPassword }"
                    @change="(e) => formData.password = e.value"
                ></t-input>
            </view>

            <view class="form-options">
                <t-checkbox-group :value="rememberMe" @change="(e) => rememberMe = e.value">
                    <t-checkbox :value="true" label="记住我"></t-checkbox>
                </t-checkbox-group>
                <text class="forget-pwd" @click="goToForgetPassword">忘记密码？</text>
            </view>

            <t-button
                theme="primary"
                size="large"
                block
                class="login-btn"
                @click="handleLogin"
            >登录</t-button>

            <view class="register-link">
                <text>还没有账号？</text>
                <text class="link-text" @click="goToRegister"
                    >立即注册</text
                >
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

        <!-- 添加微信登录按钮 -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="wechat-login-section">
            <view class="divider">
                <text class="divider-text">其他登录方式</text>
            </view>
            <view class="wechat-login-container">
                <view class="wechat-login-btn" @click="handleUseWXLogin">
                    <t-icon
                        name="logo-wechat"
                        color="#ffffff"
                        size="40"
                    ></t-icon>
                </view>
                <text class="wechat-login-text">微信一键登录</text>
            </view>
        </view>
        <!-- #endif -->

        <t-message ref="t-message" />
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, getCurrentInstance } from "vue";
import { UserAccountLogin } from "../../API/My/UserLoginAPI";
import { checkUserBind } from "../../API/My/UserInfoUpdateAPI";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import { wechatLogin } from "../../util/auth/wechatLogin";
import navBarHeightUtil from "../../util/ui/navBar";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import UserAgreementTips from "../../components/modules/my/UserAgreementTips.vue";
import logSDK from "../../util/log/sdk";
import { setMessageInstance, showSuccess, showError, showWarning } from "../../util/ui/message";

const instance = getCurrentInstance();
const AGREED_KEY = "user_agreed_policy";
const showPassword = ref(true);
const rememberMe = ref([]);
const agreed = ref(uni.getStorageSync(AGREED_KEY) || false);

watch(agreed, (val) => {
    uni.setStorageSync(AGREED_KEY, val);
});
const userInfoStore = UserInfoStore();
const navBarInfo = ref(0); // 导航栏高度信息
const REMEMBER_LOGIN_KEY = "user_login_remember_info";

const isRememberChecked = computed(() => rememberMe.value.includes(true));

// 计算返回按钮的top位置
const backBtnTop = computed(() => {
    // 根据导航栏高度信息计算返回按钮位置
    return navBarInfo.value ? navBarInfo.value + "rpx" : "75rpx";
});

const formData = reactive({
    email: "",
    password: "",
});

// 读取记住的账号密码
const loadRememberedLogin = () => {
    const savedLogin = uni.getStorageSync(REMEMBER_LOGIN_KEY);
    if (!savedLogin || typeof savedLogin !== "object") return;

    if (savedLogin.email) {
        formData.email = savedLogin.email;
    }
    if (savedLogin.password) {
        formData.password = savedLogin.password;
    }
    rememberMe.value = [true];
};

// 保存或清理记住我信息
const persistRememberLogin = () => {
    if (isRememberChecked.value) {
        uni.setStorageSync(REMEMBER_LOGIN_KEY, {
            email: formData.email || "",
            password: formData.password || "",
        });
    } else {
        uni.removeStorageSync(REMEMBER_LOGIN_KEY);
    }
};

// 返回上一页的方法
const goBack = () => {
    uni.switchTab({
        url: "/pages/tab/my",
    });
};

const handleLogin = async () => {
    if (!agreed.value) {
        showWarning("请先阅读并同意用户协议和隐私政策");
        return;
    }
    try {
        const response = await UserAccountLogin({
            account: formData.email,
            password: formData.password,
        });

        // 处理登录成功的情况
        if (response.code === 200 && response.success) {
            showSuccess("登录成功");
            uni.setStorageSync("token", response.data.token); // 存储 Token
            userInfoStore.setUserInfo(response.data.userInfo); // 存储用户信息
            persistRememberLogin();

            // 埋点：账号密码登录成功
            logSDK.track("AUTH_LOGIN", {
                result: logSDK.results.SUCCESS,
                metadata: { method: "account" },
            });

            // 登录成功后返回上一页
            setTimeout(() => {
                uni.switchTab({
                    url: "/pages/tab/my",
                });
            }, 1500);
            return;
        }

        // 处理各种错误情况
        if (response.code === 404) {
            // 账号尚未注册
            uni.showModal({
                title: "提示",
                content: response.message || "账号尚未注册",
                confirmText: "去注册",
                success: function (res) {
                    if (res.confirm) {
                        uni.navigateTo({
                            url: "/pages/my/UserRegisterView",
                        });
                    }
                },
            });
            // 埋点：账号不存在
            logSDK.track("AUTH_LOGIN", {
                result: logSDK.results.FAIL,
                errorCode: "404",
                errorMessage: response.message || "账号尚未注册",
                metadata: { method: "account" },
            });
        } else if (response.code === 401) {
            // 密码或账号错误
            showError(response.message || "密码或账号错误");
            // 埋点：密码或账号错误
            logSDK.track("AUTH_LOGIN", {
                result: logSDK.results.FAIL,
                errorCode: "401",
                errorMessage: response.message || "密码或账号错误",
                metadata: { method: "account" },
            });
        } else {
            // 其他错误
            showError(response.message || "登录失败，请稍后重试");
            // 埋点：其他业务错误
            logSDK.track("AUTH_LOGIN", {
                result: logSDK.results.FAIL,
                errorCode: String(response.code || ""),
                errorMessage: response.message || "登录失败，请稍后重试",
                metadata: { method: "account" },
            });
        }
    } catch (error) {
        // 网络错误或其他异常
        showError(error.message || "网络异常，请稍后重试");
        // 埋点：网络异常或未知错误
        logSDK.track("AUTH_LOGIN", {
            result: logSDK.results.FAIL,
            errorMessage: error.message || "网络异常，请稍后重试",
            metadata: { method: "account" },
        });
    }
};

// 微信登录方法 - 使用工具函数
const handleUseWXLogin = async () => {
    if (!agreed.value) {
        showWarning("请先阅读并同意用户协议和隐私政策");
        return;
    }
    try {
        await wechatLogin();
    } catch (error) {
        console.error("微信登录失败", error);
        showError("微信登录失败");
    }
};

const goToRegister = async () => {
    // #ifdef MP-WEIXIN
    let token = uni.getStorageSync("token");
    if (!token) {
        try {
            await wechatLogin({
                navigateToMy: false,
            });
            token = uni.getStorageSync("token");
        } catch {
            return;
        }
    }

    if (!token) {
        showWarning("请先完成微信登录");
        return;
    }

    try {
        const bindResponse = await checkUserBind();
        if (bindResponse.code === 200 && bindResponse.data?.isBind) {
            uni.switchTab({
                url: "/pages/tab/my",
            });
            return;
        }
    } catch {
        showError("绑定状态校验失败，请稍后重试");
        return;
    }

    uni.navigateTo({
        url: "/pages/my/UserRegisterView?isBind=true",
    });
    // #endif

    // #ifndef MP-WEIXIN
    uni.navigateTo({
        url: "/pages/my/UserRegisterView",
    });
    // #endif
};

// 跳转忘记密码
const goToForgetPassword = () => {
    uni.navigateTo({
        url: "/pages/my/UserForgetPasswordView",
    });
};

// 用户服务协议
const showUserAgreement = () => {
    uni.navigateTo({
        url: "/pages/public/UserAgreementView",
    });
};

//隐私政策
const showPrivacyPolicy = () => {
    uni.navigateTo({
        url: "/pages/public/PrivacyPolicyView",
    });
};

// 计算导航栏高度
onMounted(() => {
    const info = navBarHeightUtil.getNavBarInfo();
    navBarInfo.value = info.totalHeight;
    loadRememberedLogin();
    setMessageInstance(instance.proxy);
});

watch(
    [() => formData.email, () => formData.password, isRememberChecked],
    () => {
        persistRememberLogin();
    },
);
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: var(--app-brand-light);
    padding: 40rpx;
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

    // 装饰性背景元素
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

    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20rpx 0 30rpx;

        .forget-pwd {
            color: var(--app-brand);
            font-size: calc(28rpx * var(--app-font-scale, 1));
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

// 微信登录部分样式
.wechat-login-section {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;

    .divider {
        width: 100%;
        text-align: center;
        margin-bottom: 50rpx;
        position: relative;

        &::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: var(--app-bg-secondary);
        }

        .divider-text {
            font-size: calc(26rpx * var(--app-font-scale, 1));
            color: var(--app-text-secondary);
            background-color: var(--app-brand-light);
            padding: 0 20rpx;
            position: relative;
            z-index: 1;
        }
    }

    .wechat-login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .wechat-login-btn {
        width: 120rpx;
        height: 120rpx;
        background: linear-gradient(135deg, #09bb07, #07c160);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 8rpx 25rpx rgba(9, 187, 7, 0.4);
        transition: all 0.3s ease;
        margin-bottom: 10rpx;

        &:active {
            transform: scale(0.95);
            box-shadow: 0 4rpx 15rpx rgba(9, 187, 7, 0.4);
        }
    }

    .wechat-login-text {
        font-size: calc(26rpx * var(--app-font-scale, 1));
        color: var(--app-text-secondary);
        margin-top: 5rpx;
    }
}
</style>
