<template>
    <ThemeProvider>
    <CustomNavBar title="编辑错题本" @back="handleNavBack" />
    <view class="container">
        <view v-if="loading" class="loading-container">
            <view class="loading-spinner">
                <view class="spinner-circle"></view>
            </view>
            <text class="loading-text">加载中...</text>
        </view>

        <view v-else class="content-wrapper">
            <!-- 预览卡片 -->
            <view class="preview-section">
                <view class="preview-title">效果预览</view>
                <view
                    class="preview-card"
                    :style="{ backgroundColor: formData.color || '#ddd' }"
                >
                    <view class="preview-card-bg"></view>
                    <view class="preview-icon">
                        <uni-icons
                            type="star-filled"
                            size="32"
                            color="#fff"
                        ></uni-icons>
                    </view>
                    <view class="preview-book-title">{{
                        formData.title || "错题本名称"
                    }}</view>
                    <view class="preview-footer">
                        <view class="preview-tag">
                            <uni-icons
                                type="calendar"
                                size="14"
                                color="rgba(255,255,255,0.9)"
                            ></uni-icons>
                            <text>刚刚</text>
                        </view>
                        <view class="preview-tag">
                            <uni-icons
                                type="list"
                                size="14"
                                color="rgba(255,255,255,0.9)"
                            ></uni-icons>
                            <text>0 题</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-container">
                <!-- 错题本名称 -->
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons
                            type="compose"
                            size="20"
                            color="#333"
                            class="label-icon"
                        ></uni-icons>
                        错题本名称
                        <text class="required">*</text>
                    </view>
                    <view
                        class="input-wrapper"
                        :class="{ 'has-error': validationErrors.title }"
                    >
                        <input
                            class="form-input"
                            :class="{ 'is-error': validationErrors.title }"
                            v-model="formData.title"
                            placeholder="请输入错题本名称"
                            placeholder-class="input-placeholder"
                            maxlength="20"
                            @input="handleTitleInput"
                        />
                        <text class="char-count"
                            >{{ formData.title.length }}/20</text
                        >
                    </view>
                    <view v-if="validationErrors.title" class="form-error">
                        <uni-icons
                            type="info-filled"
                            size="14"
                            color="#f44336"
                        ></uni-icons>
                        <text>{{ validationErrors.title }}</text>
                    </view>
                </view>

                <!-- 颜色选择 -->
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons
                            type="color"
                            size="20"
                            color="#333"
                            class="label-icon"
                        ></uni-icons>
                        选择封面颜色
                        <text class="required">*</text>
                    </view>
                    <view class="color-picker-wrapper">
                        <scroll-view
                            class="color-scroll"
                            scroll-x
                            :show-scrollbar="false"
                        >
                            <view class="color-list">
                                <view
                                    class="color-item"
                                    v-for="color in displayColorOptions"
                                    :key="color"
                                    :style="{ backgroundColor: color }"
                                    :class="{
                                        active: formData.color === color,
                                    }"
                                    @click="selectColor(color)"
                                >
                                    <view
                                        class="color-check"
                                        v-if="formData.color === color"
                                    >
                                        <uni-icons
                                            type="checkmarkempty"
                                            size="18"
                                            color="#fff"
                                        ></uni-icons>
                                    </view>
                                </view>
                            </view>
                        </scroll-view>
                    </view>
                </view>

                <!-- 按钮组 -->
                <view class="form-actions">
                    <button
                        class="btn btn-submit"
                        :disabled="submitting"
                        :class="{ 'btn-loading': submitting }"
                        @click="handleSubmit"
                    >
                        <view v-if="submitting" class="btn-spinner">
                            <view class="spinner-circle-small"></view>
                        </view>
                        <block v-else>
                            <uni-icons
                                type="checkmarkempty"
                                size="20"
                                color="#fff"
                            ></uni-icons>
                            <text>保存修改</text>
                        </block>
                    </button>

                    <button
                        class="btn btn-delete"
                        :disabled="submitting"
                        @click="handleDelete"
                    >
                        <uni-icons
                            type="trash"
                            size="20"
                            color="#f44336"
                        ></uni-icons>
                        <text>删除错题本</text>
                    </button>
                </view>
            </view>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../../components/core/ThemeProvider.vue";
import CustomNavBar from "../../../components/common/CustomNavBar.vue";
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
    getWrongBookDetailAPI,
    updateWrongBookAPI,
    deleteWrongBookAPI,
} from "../../../API/Tools/WrongBookAPI";
import { wrongBookColors } from "../../../util/cardThemes";

const bookId = ref("");
const loading = ref(true);
const submitting = ref(false);
const displayColorOptions = ref([...wrongBookColors]);

const formData = ref({
    title: "",
    color: "",
});

const validationErrors = ref({
    title: "",
});

const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};

onLoad(async (options) => {
    if (options.id) {
        bookId.value = options.id;
        await fetchBookDetails();
    } else {
        uni.showToast({
            title: "参数错误",
            icon: "error",
        });
        setTimeout(() => uni.navigateBack(), 1000);
    }
});

const fetchBookDetails = async () => {
    loading.value = true;
    try {
        const res = await getWrongBookDetailAPI(bookId.value);
        if (res.data) {
            formData.value.title = res.data.title;
            formData.value.color = res.data.color;

            if (!displayColorOptions.value.includes(res.data.color)) {
                displayColorOptions.value = [
                    res.data.color,
                    ...wrongBookColors,
                ];
            }
        }
    } catch (error) {
        uni.showToast({
            title: "获取详情失败",
            icon: "error",
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const selectColor = (color) => {
    formData.value.color = color;
};

const handleTitleInput = () => {
    if (validationErrors.value.title) {
        validationErrors.value.title = "";
    }
};

const handleSubmit = async () => {
    if (!formData.value.title.trim()) {
        validationErrors.value.title = "请输入错题本名称";
        return;
    }

    submitting.value = true;
    try {
        await updateWrongBookAPI({
            id: bookId.value,
            title: formData.value.title,
            color: formData.value.color,
        });

        uni.$emit("wrongBook:refresh");
        uni.showToast({
            title: "修改成功",
            icon: "success",
        });

        setTimeout(() => {
            uni.navigateBack();
        }, 1500);
    } catch (error) {
        uni.showToast({
            title: "修改失败",
            icon: "error",
        });
        console.error(error);
    } finally {
        submitting.value = false;
    }
};

const handleDelete = () => {
    uni.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这个错题本吗？",
        confirmColor: "#f44336",
        success: async (confirm) => {
            if (confirm.confirm) {
                submitting.value = true;
                try {
                    const res = await deleteWrongBookAPI(bookId.value);

                    if (res.code === 200) {
                        uni.$emit("wrongBook:refresh");
                        uni.showToast({
                            title: "删除成功",
                            icon: "success",
                        });
                        setTimeout(() => {
                            uni.navigateBack();
                        }, 1500);
                    } else {
                        // 处理删除失败的情况（如：错题本中还有题目）
                        const questionCount = res.data?.questionCount;

                        if (questionCount > 0) {
                            // 错题本中有题目，提示用户
                            setTimeout(() => {
                                uni.showModal({
                                    title: "无法删除",
                                    content: res.message || "删除失败",
                                    showCancel: true,
                                    cancelText: "取消",
                                    confirmText: "去删除",
                                    confirmColor: "#1890ff",
                                    success: (modalRes) => {
                                        if (modalRes.confirm) {
                                            // 跳转到题目列表页面
                                            uni.navigateTo({
                                                url: `/pages/tools/WrongBookToolView_children/WrongQuestionListView?id=${bookId.value}&title=${encodeURIComponent(formData.value.title)}`,
                                            });
                                        }
                                    },
                                });
                            }, 300);
                        } else {
                            // 其他错误
                            uni.showToast({
                                title: res.message || "删除失败",
                                icon: "none",
                            });
                        }
                        submitting.value = false;
                    }
                } catch (error) {
                    uni.showToast({
                        title: "删除失败",
                        icon: "none",
                    });
                    console.error(error);
                    submitting.value = false;
                }
            }
        },
    });
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: var(--app-bg-page);
    padding: 30rpx 24rpx;
    box-sizing: border-box;
}

.content-wrapper {
    animation: fadeInUp 0.5s ease-out;
}

/* 预览区域 */
.preview-section {
    margin-bottom: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-title {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: #888;
    margin-bottom: 24rpx;
    font-weight: 500;
}

.preview-card {
    width: 100%;
    height: 360rpx;
    border-radius: 32rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40rpx;
    box-sizing: border-box;
    box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.15);
    transition: background-color 0.3s ease;
    overflow: hidden;
}

.preview-card-bg {
    position: absolute;
    top: -40rpx;
    right: -40rpx;
    width: 240rpx;
    height: 240rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.preview-icon {
    width: 80rpx;
    height: 80rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.preview-book-title {
    font-size: calc(40rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-bg-container);
    margin-top: auto;
    margin-bottom: 20rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.preview-footer {
    display: flex;
    align-items: center;
    gap: 24rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);
    padding-top: 24rpx;
}

.preview-tag {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: rgba(255, 255, 255, 0.9);
    background: rgba(0, 0, 0, 0.05);
    padding: 6rpx 16rpx;
    border-radius: 100rpx;
}

/* 表单区域 */
.form-container {
    background: var(--app-bg-container);
    border-radius: 32rpx;
    padding: 48rpx 32rpx;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.form-item {
    margin-bottom: 48rpx;
}

.form-label {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    margin-bottom: 24rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.label-icon {
    margin-top: -2rpx;
}

.required {
    color: var(--app-danger);
    margin-left: 4rpx;
    font-weight: normal;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 20rpx;
    padding: 0 24rpx;
    height: 100rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
}

.input-wrapper:focus-within {
    background: var(--app-bg-container);
    border-color: var(--app-success);
    box-shadow: 0 0 0 6rpx rgba(76, 175, 80, 0.1);
}

.input-wrapper.has-error {
    background: var(--app-bg-container);
    border-color: var(--app-danger);
    box-shadow: 0 0 0 6rpx rgba(244, 67, 54, 0.1);
}

.form-input {
    flex: 1;
    height: 100%;
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.input-placeholder {
    color: #bbb;
}

.char-count {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-left: 16rpx;
}

.form-error {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-danger);
    padding-left: 8rpx;
    animation: slideDown 0.3s ease;
}

/* 颜色选择 */
.color-picker-wrapper {
    background: #f5f7fa;
    border-radius: 24rpx;
    padding: 24rpx 20rpx;
}

.color-scroll {
    width: 100%;
    white-space: nowrap;
}

.color-list {
    display: inline-flex;
    gap: 24rpx;
    padding: 4rpx;
}

.color-item {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    border: 4rpx solid transparent;
    transform-origin: center;
}

.color-item.active {
    transform: scale(1.15);
    border-color: var(--app-bg-container);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

.color-check {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
}

/* 按钮组 */
.form-actions {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-top: 64rpx;
}

.btn {
    width: 100%;
    height: 100rpx;
    border-radius: 50rpx;
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: 600;
    border: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    position: relative;
    overflow: hidden;
}

.btn::after {
    border: none;
}

.btn-delete {
    background: var(--app-bg-container);
    color: var(--app-danger);
    border: 2rpx solid var(--app-danger-light);
}

.btn-delete:active {
    background: #fff5f5;
    border-color: #ffcdd2;
    transform: scale(0.98);
}

.btn-submit {
    background: linear-gradient(135deg, var(--app-success) 0%, #43a047 100%);
    color: var(--app-bg-container);
    box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.btn-submit:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.2);
}

.btn-submit:disabled,
.btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Loading 样式 */
.loading-container {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 80rpx;
    height: 80rpx;
    position: relative;
    margin-bottom: 30rpx;
}

.spinner-circle {
    width: 100%;
    height: 100%;
    border: 6rpx solid var(--app-border);
    border-top-color: var(--app-success);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.btn-spinner {
    width: 40rpx;
    height: 40rpx;
}

.spinner-circle-small {
    width: 100%;
    height: 100%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--app-bg-container);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* 动画 */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
