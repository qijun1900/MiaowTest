<template>
    <!-- 自定义 添加返回按钮 -->
    <ThemeProvider>
    <view class="back-btn" :style="{ top: backBtnTop }" @click="goBack">
        <t-icon name="arrow-left" color="#3c9cff" size="24"></t-icon>
        <text class="back-text">返回</text>
    </view>
    <view class="container">
        <!-- 页面标题 -->
        <view class="page-header">
            <text class="page-title">创建题库</text>
            <text class="page-subtitle">为您的题库命名，然后选择导入方式</text>
        </view>

        <!-- 题库名称输入区域 -->
        <view class="name-input-section">
            <view class="input-card">
                <view class="input-header">
                    <uni-icons
                        type="compose"
                        size="20"
                        color="#2979FF"
                    ></uni-icons>
                    <text class="input-title">题库名称</text>
                </view>
                <view class="input-container">
                    <t-input
                        class="name-input"
                        :value="questionBankName"
                        placeholder="请输入题库名称（2-20个字符）"
                        maxlength="20"
                        borderless
                        @change="validateName"
                    >
                        <template #suffix>
                            <text class="input-counter"
                                >{{ questionBankName.length }}/20</text
                            >
                        </template>
                    </t-input>
                </view>
                <view class="input-tips" v-if="nameError">
                    <uni-icons
                        type="info"
                        size="14"
                        color="#ff4d4f"
                    ></uni-icons>
                    <text class="error-text">{{ nameError }}</text>
                </view>
                <view
                    class="input-tips"
                    v-else-if="questionBankName.length > 0"
                >
                    <uni-icons
                        type="checkmark"
                        size="14"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="success-text">名称格式正确</text>
                </view>
            </view>
        </view>

        <!-- 导入选项卡片 -->
        <view class="import-options" :class="{ disabled: !isNameValid }">
            <view class="disabled-overlay" v-if="!isNameValid">
                <text class="disabled-text">请先输入有效的题库名称</text>
            </view>

            <!-- 手动导入 -->
            <view
                class="option-card"
                @click="handleManualImport"
                :class="{ disabled: !isNameValid }"
            >
                <view class="card-icon">
                    <uni-icons
                        type="list"
                        size="24"
                        color="#ffffff"
                    ></uni-icons>
                </view>
                <view class="card-content">
                    <text class="option-title">手动导入</text>
                    <text class="option-desc">逐题录入，适合少量题目</text>
                </view>
                <view class="card-arrow">
                    <uni-icons
                        type="forward"
                        size="20"
                        color="#007AFF"
                    ></uni-icons>
                </view>
            </view>

            <!-- 拍照导入 -->
            <view
                class="option-card"
                @click="handlePhotoImport"
                :class="{ disabled: !isNameValid }"
            >
                <view class="card-icon">
                    <uni-icons
                        type="camera"
                        size="24"
                        color="#ffffff"
                    ></uni-icons>
                </view>
                <view class="card-content">
                    <text class="option-title">拍照导入</text>
                    <text class="option-desc">拍摄试卷照片，自动识别题目</text>
                </view>
                <view class="card-arrow">
                    <uni-icons
                        type="forward"
                        size="20"
                        color="#007AFF"
                    ></uni-icons>
                </view>
            </view>

            <!-- AI导入 -->
            <view
                class="option-card"
                @click="handleAIImport"
                :class="{ disabled: !isNameValid }"
            >
                <view class="card-icon">
                    <uni-icons
                        type="star"
                        size="24"
                        color="#ffffff"
                    ></uni-icons>
                </view>
                <view class="card-content">
                    <text class="option-title">AI导入</text>
                    <text class="option-desc">智能生成题目，快速创建题库</text>
                </view>
                <view class="card-arrow">
                    <uni-icons
                        type="forward"
                        size="20"
                        color="#007AFF"
                    ></uni-icons>
                </view>
            </view>
        </view>

        <!-- 功能说明区域 -->
        <view class="feature-section">
            <view class="feature-title">导入功能说明</view>
            <view class="feature-list">
                <view class="feature-item">
                    <uni-icons
                        type="checkmark"
                        size="16"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="feature-text"
                        >支持多种题型：单选、多选、填空、判断、简答</text
                    >
                </view>
                <view class="feature-item">
                    <uni-icons
                        type="checkmark"
                        size="16"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="feature-text">智能识别题目内容，自动分类</text>
                </view>
                <view class="feature-item">
                    <uni-icons
                        type="checkmark"
                        size="16"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="feature-text">云端同步，多设备访问</text>
                </view>
                <view class="feature-item">
                    <uni-icons
                        type="checkmark"
                        size="16"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="feature-text">支持批量导入，提高效率</text>
                </view>
                <view class="feature-item">
                    <uni-icons
                        type="checkmark"
                        size="16"
                        color="#4cd964"
                    ></uni-icons>
                    <text class="feature-text">支持AI快速生成解析</text>
                </view>
            </view>
        </view>

        <!-- 装饰性背景元素 -->
        <view class="bg-decoration top-left"></view>
        <view class="bg-decoration top-right"></view>
        <view class="bg-decoration bottom-left"></view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { ref, computed, onMounted } from "vue";
import { AddUserBank } from "../../API/Exam/ExamAPI";
import navBarHeightUtil from "../../util/navBarHeight";
import checkLogin from "../../util/checkLogin";
import showModal from "../../util/showModal";

const navBarInfo = ref(0); // 导航栏高度信息
// 题库名称和验证状态
const questionBankName = ref("");
const nameError = ref("");
// 计算返回按钮的top位置
const backBtnTop = computed(() => {
    // 根据导航栏高度信息计算返回按钮位置
    return navBarInfo.value ? navBarInfo.value + "rpx" : "75rpx";
});
const goBack = () => {
    uni.navigateBack({ delta: 1 }); // 返回上一页
};

// 计算属性：检查名称是否有效
const isNameValid = computed(() => {
    return (
        questionBankName.value.length >= 2 &&
        questionBankName.value.length <= 20 &&
        !nameError.value
    );
});

// 名称验证函数
const validateName = (e) => {
    questionBankName.value = e.value;
    const name = questionBankName.value.trim();

    if (name.length === 0) {
        nameError.value = "";
        return;
    }

    if (name.length < 2) {
        nameError.value = "题库名称至少需要2个字符";
    } else if (name.length > 20) {
        nameError.value = "题库名称不能超过20个字符";
    } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/.test(name)) {
        nameError.value = "名称只能包含中文、英文、数字、下划线和减号";
    } else {
        nameError.value = "";
    }
};

// 手动导入
const handleManualImport = async () => {
    if (!isNameValid.value) {
        uni.showToast({
            title: "请先输入有效的题库名称",
            icon: "none",
        });
        return;
    }

    try {
        const modal = await showModal({
            title: "手动导入",
            content: `即将为题库"${questionBankName.value}"进行手动导入`,
        });
        if (!modal.confirm) {
            return; // 如果用户取消，直接返回
        }
        const res = await AddUserBank(questionBankName.value);

        if (modal.confirm && res.code === 200) {
            // 获取返回的题库ID
            const bankId = res.data?.bankId;
            uni.navigateTo({
                url: `/pages/exam/ManualImportView?bankName=${questionBankName.value}&bankId=${bankId}&isNewCreate=true`,
            });
        }
    } catch (error) {
        console.error("手动导入出错:", error);
    }
};
//拍照
//TODO拍照导入题目
const handlePhotoImport = async () => {
    if (!isNameValid.value) {
        uni.showToast({
            title: "请先输入有效的题库名称",
            icon: "none",
        });
        return;
    }
    uni.showToast({
        title: "开发中",
        icon: "none",
    });

    // try {
    //     const modal = await showModal({
    //         title: '拍照导入',
    //         content: `即将为题库"${questionBankName.value}"进行拍照导入`
    //     });

    //     if (modal.confirm) {
    //         const res = await AddUserBank(questionBankName.value)
    //         console.log(res)

    //         if (res.code===200) {
    //             // 获取返回的题库ID
    //             const bankId = res.data?.bankId;
    //             uni.navigateTo({
    //                 url: `/pages/exam/photoImportView?bankName=${encodeURIComponent(questionBankName.value)}&bankId=${bankId}`
    //             })
    //         }
    //     }
    // } catch (error) {
    //     console.error('拍照导入出错:', error);
    // }
};
//Ai
//TODO AI导入题目
const handleAIImport = async () => {
    if (!isNameValid.value) {
        uni.showToast({
            title: "请先输入有效的题库名称",
            icon: "none",
        });
        return;
    }
    uni.showToast({
        title: "开发中",
        icon: "none",
    });

    // try {
    //     const modal = await showModal({
    //         title: 'AI导入',
    //         content: `即将为题库"${questionBankName.value}"进行AI智能导入`
    //     });

    //     if (modal.confirm) {
    //         const res = await AddUserBank(questionBankName.value)
    //         console.log(res)

    //         if (res.code===200) {
    //             // 获取返回的题库ID
    //             const bankId = res.data?.bankId;
    //             uni.navigateTo({
    //                 url: `/pages/exam/aiImportView?bankName=${questionBankName.value}&bankId=${bankId}`
    //             })
    //         }
    //     }
    // } catch (error) {
    //     console.error('AI导入出错:', error);
    // }
};

// 页面加载时检查用户是否已登录
onMounted(async () => {
    // 获取导航栏高度信息
    const info = navBarHeightUtil.getNavBarInfo();
    navBarInfo.value = info.totalHeight;

    // 检查用户是否已登录
    const isLoggedIn = await checkLogin("请登录后再创建题库");
    if (!isLoggedIn) {
        // 用户未登录，函数已自动跳转到登录页，无需继续执行
        return;
    }
});
</script>

<style lang="scss" scoped>
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
.container {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--app-brand-light) 0%, #e6f2ff 100%);
    padding: 100rpx 30rpx 30rpx 30rpx;
    position: relative;
    overflow: hidden;
}

.page-header {
    text-align: center;
    margin-bottom: 40rpx;
    margin-top: 20rpx;
}

.page-title {
    display: block;
    font-size: calc(44rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-brand);
    margin-bottom: 16rpx;
    line-height: 1.3;
}

.page-subtitle {
    display: block;
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    line-height: 1.5;
}

.name-input-section {
    margin-bottom: 40rpx;
}

.input-card {
    background: linear-gradient(135deg, var(--app-bg-container) 0%, #f8fbff 100%);
    border-radius: 20rpx;
    padding: 32rpx 28rpx;
    box-shadow: 0 6rpx 24rpx rgba(41, 121, 255, 0.1);
    border: 1rpx solid rgba(41, 121, 255, 0.15);
}

.input-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    gap: 12rpx;
}

.input-title {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
}

.input-container {
    position: relative;
    margin-bottom: 16rpx;
}

.name-input {
    width: 100%;

    :deep(.t-input) {
        height: 72rpx;
        padding: 0 28rpx;
        background: var(--app-bg-secondary);
        border: 2rpx solid #e9ecef;
        border-radius: 12rpx;
        font-size: calc(28rpx * var(--app-font-scale, 1));
        color: var(--app-text-primary);
        transition: all 0.3s ease;

        &:focus {
            border-color: var(--app-brand);
            background: var(--app-bg-container);
            box-shadow: 0 0 0 3rpx rgba(41, 121, 255, 0.1);
        }

        &::placeholder {
            color: var(--app-text-secondary);
            font-size: calc(26rpx * var(--app-font-scale, 1));
        }
    }
}

.input-counter {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    background: rgba(255, 255, 255, 0.8);
    padding: 4rpx 8rpx;
    border-radius: 6rpx;
}

.input-tips {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 8rpx;
}

.error-text {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-danger);
}

.success-text {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-success);
}

.import-options {
    margin-bottom: 50rpx;
    position: relative;

    &.disabled {
        opacity: 0.6;
        pointer-events: none;
    }
}

.disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 20rpx;
    backdrop-filter: blur(4rpx);
}

.disabled-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    font-weight: bold;
    background: rgba(255, 255, 255, 0.8);
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    border: 1rpx solid rgba(0, 0, 0, 0.1);
}

.option-card {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, var(--app-bg-container) 0%, #f8fbff 100%);
    border-radius: 20rpx;
    padding: 32rpx 28rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 6rpx 24rpx rgba(41, 121, 255, 0.08);
    border: 1rpx solid rgba(41, 121, 255, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:active:not(.disabled) {
        transform: translateY(2rpx);
        box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.12);
        border-color: rgba(41, 121, 255, 0.2);
    }

    &.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
}

.card-icon {
    width: 72rpx;
    height: 72rpx;
    background: linear-gradient(135deg, var(--app-brand) 0%, #4dabf5 100%);
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.2);
    flex-shrink: 0;
}

.card-content {
    flex: 1;
    min-width: 0;
}

.option-title {
    display: block;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 6rpx;
    line-height: 1.3;
}

.option-desc {
    display: block;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    line-height: 1.4;
}

.card-arrow {
    color: var(--app-brand);
    flex-shrink: 0;
    margin-left: 16rpx;
}

.feature-section {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16rpx;
    padding: 32rpx 28rpx;
    backdrop-filter: blur(8rpx);
    border: 1rpx solid rgba(41, 121, 255, 0.1);
    box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.05);
}

.feature-title {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-brand);
    margin-bottom: 24rpx;
    text-align: center;
}

.feature-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
}

.feature-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.5;
    flex: 1;
}

// 装饰性背景元素
.bg-decoration {
    position: absolute;
    border-radius: 50%;
    z-index: 0;
    background: linear-gradient(
        135deg,
        rgba(41, 121, 255, 0.05),
        rgba(41, 121, 255, 0.02)
    );

    &.top-left {
        width: 180rpx;
        height: 180rpx;
        top: -40rpx;
        left: -40rpx;
    }

    &.top-right {
        width: 140rpx;
        height: 140rpx;
        top: 80rpx;
        right: -25rpx;
    }

    &.bottom-left {
        width: 160rpx;
        height: 160rpx;
        bottom: 80rpx;
        left: -35rpx;
    }
}

// 响应式适配
@media (max-width: 750rpx) {
    .container {
        padding: 30rpx 24rpx;
    }

    .input-card,
    .option-card {
        padding: 28rpx 24rpx;
    }

    .card-icon {
        width: 64rpx;
        height: 64rpx;
        margin-right: 20rpx;
        border-radius: 16rpx;
    }

    .option-title {
        font-size: calc(28rpx * var(--app-font-scale, 1));
    }

    .option-desc {
        font-size: calc(22rpx * var(--app-font-scale, 1));
    }
}
</style>
