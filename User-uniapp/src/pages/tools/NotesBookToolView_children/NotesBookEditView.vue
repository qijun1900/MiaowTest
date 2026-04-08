<template>
    <view class="container">
        <view v-if="loading" class="loading-container">
            <view class="loading-spinner">
                <view class="spinner-circle"></view>
            </view>
            <text class="loading-text">加载中...</text>
        </view>

        <view v-else class="content-wrapper">
            <view class="form-container">
                <view class="form-item">
                    <view class="form-label">
                        <uni-icons
                            type="compose"
                            size="20"
                            color="#333"
                            class="label-icon"
                        ></uni-icons>
                        笔记本名称
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
                            placeholder="请输入笔记本名称"
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

                <view class="form-item">
                    <view class="form-label">
                        <uni-icons
                            type="chat"
                            size="20"
                            color="#333"
                            class="label-icon"
                        ></uni-icons>
                        描述
                    </view>
                    <view class="textarea-wrapper">
                        <textarea
                            class="form-textarea"
                            v-model="formData.description"
                            placeholder="可选，简单描述这个笔记本"
                            maxlength="60"
                        ></textarea>
                        <text class="char-count description-count"
                            >{{ formData.description.length }}/60</text
                        >
                    </view>
                </view>

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
                        <text>删除笔记本</text>
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
    getNotebookDetailAPI,
    updateNotebookAPI,
    deleteNotebookAPI,
} from "../../../API/Tools/NotesBookAPI";

const bookId = ref("");
const loading = ref(true);
const submitting = ref(false);

const formData = ref({
    title: "",
    description: "",
});

const validationErrors = ref({
    title: "",
});

onLoad(async (options) => {
    if (options.id) {
        bookId.value = options.id;
        await fetchBookDetails();
    } else {
        uni.showToast({
            title: "参数错误",
            icon: "none",
        });
        setTimeout(() => uni.navigateBack(), 1000);
    }
});

const fetchBookDetails = async () => {
    loading.value = true;
    try {
        const res = await getNotebookDetailAPI(bookId.value);
        if (res.code !== 200 || !res.data) {
            throw new Error(res.message || "获取详情失败");
        }

        formData.value.title = res.data.title || "";
        formData.value.description = res.data.description || "";
    } catch (error) {
        uni.showToast({
            title: "获取详情失败",
            icon: "none",
        });
        console.error("获取笔记本详情失败:", error);
        setTimeout(() => uni.navigateBack(), 1000);
    } finally {
        loading.value = false;
    }
};

const handleTitleInput = () => {
    if (validationErrors.value.title) {
        validationErrors.value.title = "";
    }
};

const handleSubmit = async () => {
    const title = formData.value.title.trim();
    const description = formData.value.description.trim();

    if (!title) {
        validationErrors.value.title = "请输入笔记本名称";
        return;
    }

    submitting.value = true;
    try {
        const res = await updateNotebookAPI({
            id: bookId.value,
            title,
            description,
        });

        if (res.code !== 200) {
            throw new Error(res.message || "修改失败");
        }

        uni.showToast({
            title: "修改成功",
            icon: "success",
        });

        setTimeout(() => {
            uni.navigateBack();
        }, 1200);
    } catch (error) {
        if (String(error?.message || "").includes("已存在")) {
            validationErrors.value.title = "笔记本名称已存在，请更换名称";
        }

        uni.showToast({
            title: error?.message || "修改失败",
            icon: "none",
        });
        console.error("更新笔记本失败:", error);
    } finally {
        submitting.value = false;
    }
};

const handleDelete = () => {
    uni.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这个笔记本吗？",
        confirmColor: "#f44336",
        success: async (confirm) => {
            if (!confirm.confirm) return;

            submitting.value = true;
            try {
                const res = await deleteNotebookAPI(bookId.value);

                if (res.code === 200) {
                    uni.showToast({
                        title: "删除成功",
                        icon: "success",
                    });
                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1200);
                    return;
                }

                if (res.code === 409 && Number(res.data?.noteCount) > 0) {
                    uni.showModal({
                        title: "无法删除",
                        content:
                            res.message || "该笔记本还有笔记，请先清空后再删除",
                        showCancel: false,
                        confirmText: "知道了",
                    });
                } else {
                    uni.showToast({
                        title: res.message || "删除失败",
                        icon: "none",
                    });
                }
            } catch (error) {
                console.error("删除笔记本失败:", error);
                uni.showToast({
                    title: "删除失败",
                    icon: "none",
                });
            } finally {
                submitting.value = false;
            }
        },
    });
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #fff9f2;
    padding: 30rpx 24rpx;
    box-sizing: border-box;
}

.content-wrapper {
    animation: fadeInUp 0.5s ease-out;
}

.form-container {
    background: #fff;
    border-radius: 32rpx;
    padding: 48rpx 32rpx;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.form-item {
    margin-bottom: 48rpx;
}

.form-label {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 24rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.required {
    color: #f44336;
    margin-left: 4rpx;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 18rpx;
    padding: 0 24rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
}

.input-wrapper:focus-within {
    background: #fff;
    border-color: #4d62ff;
    box-shadow: 0 0 0 4rpx rgba(77, 98, 255, 0.1);
}

.input-wrapper.has-error {
    border-color: #f44336;
    background: #fff;
}

.form-input {
    flex: 1;
    height: 96rpx;
    font-size: 30rpx;
    color: #333;
}

.form-input.is-error {
    color: #f44336;
}

.textarea-wrapper {
    background: #f8f8f8;
    border-radius: 18rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid transparent;
}

.textarea-wrapper:focus-within {
    background: #fff;
    border-color: #4d62ff;
    box-shadow: 0 0 0 4rpx rgba(77, 98, 255, 0.1);
}

.form-textarea {
    width: 100%;
    min-height: 140rpx;
    font-size: 28rpx;
    line-height: 1.5;
    color: #333;
}

.char-count {
    font-size: 24rpx;
    color: #999;
}

.description-count {
    display: block;
    text-align: right;
}

.form-error {
    margin-top: 16rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #f44336;
}

.form-actions {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.btn {
    width: 100%;
    height: 96rpx;
    border-radius: 48rpx;
    border: none;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.btn-submit {
    background: linear-gradient(135deg, #4d62ff 0%, #3f57f0 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(77, 98, 255, 0.32);
}

.btn-submit:disabled {
    opacity: 0.6;
}

.btn-delete {
    background: #fff;
    color: #f44336;
    border: 2rpx solid #ffd6d6;
}

.btn-delete:disabled {
    opacity: 0.6;
}

.btn-loading {
    background: linear-gradient(135deg, #7f8cff 0%, #707fff 100%) !important;
}

.btn-spinner {
    width: 32rpx;
    height: 32rpx;
}

.spinner-circle-small {
    width: 100%;
    height: 100%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-container {
    min-height: 56vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 80rpx;
    height: 80rpx;
}

.spinner-circle {
    width: 100%;
    height: 100%;
    border: 6rpx solid #e0e0e0;
    border-top-color: #4d62ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #666;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(24rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
