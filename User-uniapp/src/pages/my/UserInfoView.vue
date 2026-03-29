<template>
    <view class="container">
        <!-- 用户头像区域 -->
        <view class="avatar-section" @click="handleEditAvatar">
            <view class="avatar-wrapper">
                <userAvatar :width="160" :height="160" :showOnline="false" />
            </view>
            <view class="edit-avatar-btn">
                <up-icon name="edit-pen" size="16px"></up-icon>
                <text>更换头像</text>
            </view>
        </view>

        <!-- 用户信息列表 -->
        <view class="info-list">
            <view class="info-item" @click="handleEditNickname">
                <view class="info-label">昵称</view>
                <view class="info-value">
                    <text>{{ userInfoStore.userInfo?.nickname || " " }}</text>
                    <up-icon name="arrow-right" size="14px"></up-icon>
                </view>
            </view>

            <view class="info-item" @click="handleEditGender">
                <view class="info-label">性别</view>
                <view class="info-value">
                    <text>{{
                        getGenderText(userInfoStore.userInfo?.gender)
                    }}</text>
                    <up-icon name="arrow-right" size="14px"></up-icon>
                </view>
            </view>

            <view class="info-item" @click="handleCopyOpenid">
                <view class="info-label">Uid</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        userInfoStore.userInfo?.uid
                    }}</text>
                    <up-icon name="file-text" size="18px"></up-icon>
                </view>
            </view>

            <view class="info-item" @click="handleUserAgreeMent">
                <view class="info-label">用户协议</view>
                <view class="info-value">
                    <up-icon name="arrow-right" size="18px"></up-icon>
                </view>
            </view>

            <view class="info-item" @click="handlePolicy">
                <view class="info-label">隐私政策</view>
                <view class="info-value">
                    <up-icon name="arrow-right" size="18px"></up-icon>
                </view>
            </view>

            <!-- #ifdef MP-WEIXIN -->
            <view class="info-item" @click="handleUserRsgister">
                <view class="info-label">{{
                    accountBindStatus ? "已绑定账号" : "尚未绑定账号"
                }}</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        accountBindStatus
                            ? userInfoStore.userInfo?.username
                            : "立即绑定账号"
                    }}</text>
                    <up-icon
                        v-if="!accountBindStatus"
                        name="arrow-right"
                        size="14px"
                    ></up-icon>
                    <up-icon v-else name="file-text" size="18px"></up-icon>
                </view>
            </view>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <view
                class="info-item"
                @click="handleCopy(userInfoStore.userInfo?.username)"
            >
                <view class="info-label">当前账号</view>
                <view class="info-value">
                    <text class="openid-text">{{
                        userInfoStore.userInfo?.username
                    }}</text>
                    <up-icon name="file-text" size="18px"></up-icon>
                </view>
            </view>
            <!-- #endif -->
        </view>
        <!-- 退出登录按钮 -->
        <view class="logout-section">
            <view class="logout-btn" @click="handleLogout">退出登录</view>
        </view>
    </view>
</template>

<script setup>
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import handleCopy from "../../util/copy";
import { updateUserInfo, checkUserBind } from "../../API/My/UserInfoUpdateAPI"; //checkUserBind
import { onMounted, ref } from "vue";
import userAvatar from "../../components/core/userAvatar.vue";
import { httpUpload } from "../../util/http";
import escconfig from "../../config/esc.config";
import logSDK from "../../util/logSDK";

const accountBindStatus = ref(false); // 账号绑定状态
const userInfoStore = UserInfoStore();
const genderMap = {
    // 性别映射表
    0: "保密",
    1: "男",
    2: "女",
};

// 账号绑定状态计算属性，使用API来获取
const CheckaccountBindStatus = async () => {
    try {
        const response = await checkUserBind();
        if (response.code === 200) {
            accountBindStatus.value = response.data.isBind;
        }
    } catch (e) {
        console.error("获取账号绑定状态失败:", e);
        return false;
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
                        uni.showToast({ title: data.message, icon: "success" });
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
                                uni.showToast({
                                    title: parsedData.message,
                                    icon: "success",
                                });
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
                uni.showToast({ title: "头像上传失败", icon: "none" });
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

// 处理账号绑定
const handleUserRsgister = () => {
    if (!accountBindStatus.value) {
        uni.navigateTo({
            url: "/pages/my/UserRegisterView?isBind=true",
        });
    } else {
        handleCopy(userInfoStore.userInfo?.username);
    }
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
            uni.showToast({
                title: "修改成功",
                icon: "success",
            });
            return true;
        } else {
            uni.showToast({
                title: response.message || "修改失败",
                icon: "none",
            });
            return false;
        }
    } catch (error) {
        uni.showToast({
            title: "网络错误，请稍后重试",
            icon: "none",
        });
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
                uni.showToast({
                    title: "已退出登录",
                    icon: "success",
                });

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
    CheckaccountBindStatus();
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20rpx;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
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
    color: #2979ff;
}

.edit-avatar-btn text {
    margin-left: 6rpx;
}

.info-list {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 30rpx;
    color: #333333;
}

.info-value {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666666;
}

.info-value text {
    margin-right: 10rpx;
}

.openid-text {
    font-size: 24rpx;
    color: #999999;
}

.logout-section {
    margin-top: 40rpx;
}

.logout-btn {
    background-color: #ffffff;
    border-radius: 16rpx;
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: 32rpx;
    color: #ff4d4f;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
