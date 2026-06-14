<template>
    <ThemeProvider>
    <view class="container">
        <!-- 用户头像区域 -->
        <view class="avatar-section" @click="handleEditAvatar">
            <view class="avatar-wrapper">
                <userAvatar :width="160" :height="160" :showOnline="false" />
            </view>
            <view class="edit-avatar-btn">
                <t-icon name="edit" size="16px"></t-icon>
                <text>更换头像</text>
            </view>
        </view>

        <!-- 用户信息列表 -->
        <view class="info-list">
            <view class="info-item" @click="handleEditNickname">
                <view class="info-label">昵称</view>
                <view class="info-value">
                    <text>{{ userInfoStore.userInfo?.nickname || " " }}</text>
                    <t-icon name="chevron-right" size="14px"></t-icon>
                </view>
            </view>

            <view class="info-item" @click="handleEditGender">
                <view class="info-label">性别</view>
                <view class="info-value">
                    <text>{{
                        getGenderText(userInfoStore.userInfo?.gender)
                    }}</text>
                    <t-icon name="chevron-right" size="14px"></t-icon>
                </view>
            </view>

            <view class="info-item" @click="handleCopyOpenid">
                <view class="info-label">Uid</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        userInfoStore.userInfo?.uid
                    }}</text>
                    <t-icon name="copy" size="18px"></t-icon>
                </view>
            </view>

            <view class="info-item" @click="handleUserAgreeMent">
                <view class="info-label">用户协议</view>
                <view class="info-value">
                    <t-icon name="chevron-right" size="18px"></t-icon>
                </view>
            </view>

            <view class="info-item" @click="handlePolicy">
                <view class="info-label">隐私政策</view>
                <view class="info-value">
                    <t-icon name="chevron-right" size="18px"></t-icon>
                </view>
            </view>

            <!-- 邮箱绑定状态 -->
            <view class="info-item" @click="handleBindEmail">
                <view class="info-label">邮箱账号</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        bindStatus.isEmailBound
                            ? bindStatus.email
                            : "未绑定"
                    }}</text>
                    <t-icon
                        v-if="bindStatus.isEmailBound"
                        name="check-circle"
                        size="18px"
                        color="#07c160"
                    ></t-icon>
                    <t-icon v-else name="chevron-right" size="14px"></t-icon>
                </view>
            </view>

            <!-- 微信绑定状态 -->
            <view class="info-item" @click="handleBindWechat">
                <view class="info-label">微信账号</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        bindStatus.isWechatBound
                            ? "已绑定"
                            : "未绑定"
                    }}</text>
                    <t-icon
                        v-if="bindStatus.isWechatBound"
                        name="check-circle"
                        size="18px"
                        color="#07c160"
                    ></t-icon>
                    <t-icon v-else name="chevron-right" size="14px"></t-icon>
                </view>
            </view>
        </view>
        <!-- 退出登录按钮 -->
        <view class="logout-section">
            <view class="logout-btn" @click="handleLogout">退出登录</view>
        </view>

        <t-message ref="t-message" />
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import handleCopy from "../../util/copy";
import { updateUserInfo, checkUserBind } from "../../API/My/UserInfoUpdateAPI";
import { onMounted, ref, getCurrentInstance } from "vue";
import { setMessageInstance, showSuccess, showError, showWarning } from "../../util/showMessage";
import userAvatar from "../../components/core/userAvatar.vue";
import { httpUpload } from "../../util/http";
import escconfig from "../../config/esc.config";
import logSDK from "../../util/logSDK";
// #ifdef MP-WEIXIN
import { wechatBind } from "../../util/wechatLogin";
// #endif

const instance = getCurrentInstance();
const bindStatus = ref({
    isEmailBound: false,
    isWechatBound: false,
    email: "",
});
const accountBindStatus = ref(false); // 兼容旧逻辑（已废弃，保留不移除以免影响其他绑定跳转）
const userInfoStore = UserInfoStore();
const genderMap = {
    0: "保密",
    1: "男",
    2: "女",
};

// 查询绑定状态（邮箱 / 微信分开）
const CheckaccountBindStatus = async () => {
    try {
        const response = await checkUserBind();
        if (response.code === 200) {
            const { isEmailBound, isWechatBound, email } = response.data;
            bindStatus.value = {
                isEmailBound: !!isEmailBound,
                isWechatBound: !!isWechatBound,
                email: email || "",
            };
            accountBindStatus.value =
                bindStatus.value.isEmailBound || bindStatus.value.isWechatBound;
        }
    } catch (e) {
        console.error("获取账号绑定状态失败:", e);
    }
};

// 将性别数字转换为文本
const getGenderText = (genderValue) => {
    return genderMap[genderValue] || "未设置";
};

//编辑头像
const handleEditAvatar = () => {
    uni.chooseMedia({
        count: 1, // 最多选择一张图片
        mediaType: ["image"], // 只允许选择图片
        sourceType: ["album", "camera"],
        success: async (res) => {
            const filePath = res.tempFiles[0].tempFilePath;
            try {
                if (escconfig.useCloudContainer) {
                    // 云托管模式：通过 httpUpload 统一处理（内部自动区分云对象存储 / base64中转OSS）
                    const ext = filePath.split(".").pop() || "jpg";
                    const uid = userInfoStore.userInfo?.uid || "anonymous";
                    const cloudPath = `user/avatar/${uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
                    const oldAvatar = userInfoStore.userInfo?.avatar;
                    const data = await httpUpload({
                        filePath: filePath,
                        url: "/uniappAPI/uploadFile/cloudAvatar",
                        cloudPath: cloudPath,
                    });
                    if (data.code === 200) {
                        // 旧云存储头像由后端 uploadCloudAvatar 统一删除（支持 OSS 和 cloud:// ）
                        showSuccess(data.message);
                        updateUserData({ avatar: data.data.avatar }, "头像");
                    }
                } else {
                    // 普通模式：直接上传到后端
                    uni.uploadFile({
                        url: "/uniappAPI/uploadFile/useravatar",
                        fileType: "image",
                        filePath: filePath,
                        name: "file",
                        success: ({ data }) => {
                            const parsedData = JSON.parse(data);
                            if (parsedData.code === 200) {
                                showSuccess(parsedData.message);
                                updateUserData(
                                    { avatar: parsedData.data.url },
                                    "头像",
                                );
                            }
                        },
                    });
                }
            } catch (err) {
                console.error("头像上传失败:", err);
                showError("头像上传失败");
            }
        },
    });
};

// 编辑昵称
const handleEditNickname = () => {
    uni.showModal({
        title: "修改昵称",
        editable: true,
        placeholderText: "请输入新昵称",
        success: async (res) => {
            if (res.confirm && res.content) {
                await updateUserData({ nickname: res.content }, "昵称");
            }
        },
    });
};

// 编辑性别
const handleEditGender = () => {
    uni.showActionSheet({
        itemList: ["男", "女", "保密"],
        success: async (res) => {
            const genderValueMap = { 0: 1, 1: 2, 2: 0 };
            await updateUserData(
                { gender: genderValueMap[res.tapIndex] },
                "性别",
            );
        },
    });
};

// 邮箱绑定：未绑定时跳转绑定页；已绑定时显示邮箱（支持复制）
const handleBindEmail = () => {
    if (bindStatus.value.isEmailBound) {
        handleCopy(bindStatus.value.email);
        return;
    }
    uni.navigateTo({
        url: "/pages/my/UserRegisterView?isBind=true",
    });
};

// 微信绑定：仅微信小程序可用，调用 wechatBind 工具
const handleBindWechat = () => {
    if (bindStatus.value.isWechatBound) {
        showSuccess("微信已绑定");
        return;
    }
    // #ifdef MP-WEIXIN
    wechatBind({
        onSuccess: () => {
            CheckaccountBindStatus();
        },
    });
    // #endif
    // #ifndef MP-WEIXIN
    showWarning("请在微信小程序内绑定");
    // #endif
};

// 复制 openid
const handleCopyOpenid = () => {
    if (userInfoStore.userInfo?.uid) {
        handleCopy(userInfoStore.userInfo.uid);
    }
};

// 通用更新用户信息函数
const updateUserData = async (userData, fieldName) => {
    try {
        const updatedUserInfo = {
            ...userInfoStore.userInfo,
            ...userData,
        };

        const response = await updateUserInfo(updatedUserInfo);

        if (response.code === 200) {
            userInfoStore.setUserInfo(response.data);
            showSuccess("修改成功");
            return true;
        } else {
            showError(response.message || "修改失败");
            return false;
        }
    } catch (error) {
        showError("网络错误，请稍后重试");
        console.error(`更新${fieldName}失败:`, error);
        return false;
    }
};

// 退出登录
const handleLogout = () => {
    uni.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
            if (res.confirm) {
                // 在清除 Store 之前先保存 uid，否则 clearUserInfo() 执行后 uid 已丢失
                const uid = userInfoStore.userInfo?.uid;

                userInfoStore.clearUserInfo(); // 清除Pinia用户信息
                uni.removeStorageSync("token"); // 清除 token
                showSuccess("已退出登录");

                // 埋点：主动退出登录，bizId 记录是哪个用户退出
                logSDK.track("AUTH_LOGOUT", {
                    result: logSDK.results.SUCCESS,
                    bizId: uid || "",
                });

                uni.navigateBack();
            }
        },
    });
};

// 用户服务协议
const handleUserAgreeMent = () => {
    uni.navigateTo({
        url: "/pages/public/UserAgreementView",
    });
};

//隐私政策
const handlePolicy = () => {
    uni.navigateTo({
        url: "/pages/public/PrivacyPolicyView",
    });
};
onMounted(() => {
    setMessageInstance(instance.proxy);
    CheckaccountBindStatus();
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    background-color: var(--app-bg-secondary);
    padding: 20rpx;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.avatar-wrapper {
    margin-bottom: 20rpx;
}

.edit-avatar-btn {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: var(--app-brand);
}

.edit-avatar-btn text {
    margin-left: 6rpx;
}

.info-list {
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid var(--app-bg-secondary);
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 30rpx;
    color: var(--app-text-primary);
}

.info-value {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: var(--app-text-secondary);
}

.info-value text {
    margin-right: 10rpx;
}

.openid-text {
    font-size: 24rpx;
    color: var(--app-text-secondary);
}

.logout-section {
    margin-top: 40rpx;
}

.logout-btn {
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: 32rpx;
    color: var(--app-danger);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
