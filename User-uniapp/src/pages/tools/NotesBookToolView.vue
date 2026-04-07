<template>
    <view class="container">
        <view class="bg-blob blob-1"></view>
        <view class="bg-blob blob-2"></view>

        <view class="hero">
            <view class="hero-left">
                <view class="section-header">
                    <view class="section-dot"></view>
                    <text class="section-title">所有笔记本</text>
                </view>
                <text class="hero-subtitle">整理知识，沉淀你的学习轨迹</text>
            </view>
            <view class="hero-stat">
                <text class="hero-stat-value">{{ decoratedNotebookList.length }}</text>
                <text class="hero-stat-label">个笔记本</text>
            </view>
        </view>

        <view v-if="loading" class="loading-container">
            <view class="loading-spinner">
                <view class="spinner-circle"></view>
            </view>
            <text class="loading-text">加载中...</text>
        </view>

        <view class="card-list" v-else>
            <view
                v-for="(item, index) in decoratedNotebookList"
                :key="item._id || index"
                class="notebook-card"
                :style="[item.cardStyle, { animationDelay: `${index * 70}ms` }]"
            >
                <view class="card-aura" :style="item.auraStyle"></view>

                <view class="edit-btn" @click.stop="handleEditNotebook(item)">
                    <uni-icons
                        type="compose"
                        size="15"
                        color="#4f6184"
                    ></uni-icons>
                </view>

                <view class="card-top">
                    <view class="count-tag" :style="item.tagStyle">
                        <text class="count-text">{{ item.noteCount }} 笔记</text>
                    </view>
                </view>

                <view class="card-content">
                    <text class="book-title">{{ item.title }}</text>
                    <text class="book-desc">{{ item.description }}</text>
                </view>

                <view class="card-footer">
                    <uni-icons type="clock" size="15" color="#7d8697"></uni-icons>
                    <text class="footer-text">{{ item.updatedAtText }}</text>
                    <view class="footer-line"></view>
                    <text class="footer-hint">最近更新</text>
                </view>
            </view>

            <view class="notebook-card create-card" @click="handleCreateNotebook">
                <view class="create-content">
                    <view class="create-icon-wrapper">
                        <view class="create-icon">
                            <uni-icons
                                type="plus"
                                size="40"
                                color="#999"
                            ></uni-icons>
                        </view>
                    </view>
                    <view class="create-text">新建笔记本</view>
                </view>
            </view>
        </view>

        <uviewPopup
            v-model:show="popupShow"
            title="创建笔记本"
            :closeable="true"
            @close="handleClosePopup"
        >
            <template #popupcontent>
                <view class="form-container">
                    <view class="form-item">
                        <view class="form-label">
                            笔记本名称
                            <text class="required">*</text>
                        </view>
                        <view
                            class="input-wrapper"
                            :class="{ 'has-error': validationErrors.title }"
                        >
                            <uni-icons
                                type="compose"
                                size="18"
                                :color="validationErrors.title ? '#f44336' : '#999'"
                            ></uni-icons>
                            <input
                                class="form-input"
                                :class="{ 'is-error': validationErrors.title }"
                                v-model="formData.title"
                                placeholder="请输入笔记本名称（最多20个字）"
                                maxlength="20"
                                @input="handleTitleInput"
                            />
                            <text class="char-count">{{ formData.title.length }}/20</text>
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
                        <view class="form-label">描述</view>
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
                            class="btn btn-cancel"
                            :disabled="submitting"
                            @click="handleClosePopup"
                        >
                            <uni-icons
                                type="closeempty"
                                size="16"
                                color="#666"
                            ></uni-icons>
                            取消
                        </button>
                        <button
                            class="btn btn-submit"
                            :disabled="submitting"
                            :class="{ 'btn-loading': submitting }"
                            @click="handleSubmit"
                        >
                            <view v-if="submitting" class="btn-spinner">
                                <view class="spinner-circle-small"></view>
                            </view>
                            <uni-icons
                                v-else
                                type="checkmarkempty"
                                size="16"
                                color="#fff"
                            ></uni-icons>
                            {{ submitting ? "创建中..." : "创建" }}
                        </button>
                    </view>
                </view>
            </template>
        </uviewPopup>
    </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import uviewPopup from "../../components/core/uviewPopup.vue";
import { createNotebookAPI, getNotebooksAPI } from "../../API/Tools/NotesBookAPI";
import formatTime from "../../util/formatTime";
import { getRandomNotebookCardThemes } from "../../util/cardThemes";

const popupShow = ref(false);
const loading = ref(false);
const submitting = ref(false);

const notebookList = ref([]);

const formData = ref({
    title: "",
    description: "",
});

const validationErrors = ref({
    title: "",
});

const cardThemes = ref(getRandomNotebookCardThemes());

const decoratedNotebookList = computed(() => {
    return notebookList.value.map((item, index) => {
        const theme = cardThemes.value[index % cardThemes.value.length];
        return {
            ...item,
            noteCount: Number(item.noteCount) || 0,
            description: item.description || "暂无描述",
            updatedAtText: item.updatedAt ? formatTime.getTime2(item.updatedAt) : "今天",
            cardStyle: theme.cardStyle,
            tagStyle: theme.tagStyle,
            auraStyle: theme.auraStyle,
        };
    });
});

const resetForm = () => {
    formData.value = {
        title: "",
        description: "",
    };
    validationErrors.value = {
        title: "",
    };
};

const handleCreateNotebook = () => {
    popupShow.value = true;
};

const handleEditNotebook = (item) => {
    uni.showToast({
        title: `编辑 ${item.title}`,
        icon: "none",
    });
};

const handleTitleInput = () => {
    if (validationErrors.value.title) {
        validationErrors.value.title = "";
    }
};

const normalizeTitle = (title = "") => String(title).trim().toLowerCase();

const isDuplicateTitle = (title = "") => {
    const normalized = normalizeTitle(title);
    return notebookList.value.some(
        (item) => normalizeTitle(item.title) === normalized,
    );
};

const handleClosePopup = () => {
    popupShow.value = false;
    resetForm();
};

const fetchNotebooks = async () => {
    loading.value = true;
    try {
        const res = await getNotebooksAPI();
        if (res.code !== 200) {
            throw new Error(res.message || "获取笔记本失败");
        }
        notebookList.value = Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        notebookList.value = [];
        uni.showToast({
            title: "获取笔记本失败",
            icon: "none",
        });
        console.error("获取笔记本失败:", error);
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async () => {
    const title = formData.value.title.trim();
    const description = formData.value.description.trim();

    if (!title) {
        validationErrors.value.title = "请输入笔记本名称";
        return;
    }

    if (isDuplicateTitle(title)) {
        validationErrors.value.title = "笔记本名称已存在，请更换名称";
        return;
    }

    submitting.value = true;
    try {
        const res = await createNotebookAPI({
            title,
            description,
        });

        if (res.code !== 200) {
            throw new Error(res.message || "创建失败，请重试");
        }

        uni.showToast({
            title: "创建成功",
            icon: "success",
        });
        await fetchNotebooks();
        handleClosePopup();
    } catch (error) {
        if (String(error?.message || "").includes("已存在")) {
            validationErrors.value.title = "笔记本名称已存在，请更换名称";
        }
        uni.showToast({
            title: error?.message || "创建失败，请重试",
            icon: "none",
        });
        console.error("创建笔记本失败:", error);
    } finally {
        submitting.value = false;
    }
};

onShow(() => {
    cardThemes.value = getRandomNotebookCardThemes();
    fetchNotebooks();
});
</script>

<style scoped>
.container {
    position: relative;
    min-height: 100vh;
    box-sizing: border-box;
    background: #fff9f2;
    padding: 26rpx 20rpx calc(46rpx + env(safe-area-inset-bottom));
    overflow: hidden;
    font-family: "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.bg-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
}

.blob-1 {
    width: 360rpx;
    height: 360rpx;
    top: -110rpx;
    right: -90rpx;
    background: radial-gradient(circle, rgba(255, 211, 158, 0.34) 0%, rgba(255, 211, 158, 0) 68%);
}

.blob-2 {
    width: 300rpx;
    height: 300rpx;
    left: -120rpx;
    top: 280rpx;
    background: radial-gradient(circle, rgba(173, 196, 255, 0.24) 0%, rgba(173, 196, 255, 0) 70%);
}

.hero {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    margin: 4rpx 6rpx 26rpx;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14rpx;
}

.section-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #4d62ff;
    box-shadow: 0 0 0 8rpx rgba(77, 98, 255, 0.12);
    flex-shrink: 0;
}

.section-title {
    font-size: 44rpx;
    color: #1a2540;
    font-weight: 700;
    letter-spacing: 0.8rpx;
}

.hero-subtitle {
    margin-top: 14rpx;
    display: block;
    font-size: 27rpx;
    color: #6e7791;
    line-height: 1.45;
}

.hero-stat {
    flex-shrink: 0;
    background: #ffffff;
    border-radius: 24rpx;
    border: 2rpx solid #e8e3db;
    padding: 12rpx 18rpx;
    box-shadow: 0 8rpx 20rpx rgba(137, 112, 84, 0.1);
    display: flex;
    align-items: baseline;
    gap: 6rpx;
    margin-top: 2rpx;
}

.hero-stat-value {
    font-size: 38rpx;
    color: #354b91;
    font-weight: 700;
}

.hero-stat-label {
    font-size: 24rpx;
    color: #7f8798;
}

.card-list {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22rpx;
}

.notebook-card {
    position: relative;
    border-radius: 34rpx;
    border: 2rpx solid #d5ddf0;
    padding: 24rpx;
    min-height: 360rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: card-enter 0.5s ease both;
}

.notebook-card:active {
    transform: scale(0.985);
}

.card-aura {
    position: absolute;
    width: 320rpx;
    height: 320rpx;
    right: -70rpx;
    top: -120rpx;
}

.card-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
}

.edit-btn {
    position: absolute;
    top: 18rpx;
    right: 18rpx;
    z-index: 3;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 247, 255, 0.92) 100%);
    border: 1rpx solid rgba(129, 149, 192, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(91, 108, 146, 0.2);
}

.edit-btn:active {
    transform: scale(0.93);
    box-shadow: 0 4rpx 10rpx rgba(91, 108, 146, 0.18);
}

.count-tag {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    border: 1rpx solid rgba(108, 127, 171, 0.18);
}

.count-text {
    font-size: 23rpx;
    color: #3f56c9;
    font-weight: 600;
}

.card-content {
    position: relative;
    z-index: 1;
    margin-top: 18rpx;
}

.book-title {
    display: block;
    font-size: 36rpx;
    color: #16233e;
    font-weight: 700;
    line-height: 1.4;
}

.book-desc {
    margin-top: 12rpx;
    font-size: 27rpx;
    color: #5f6f8a;
    line-height: 1.52;
    display: block;
    min-height: 80rpx;
}

.card-footer {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding-top: 14rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.footer-text {
    font-size: 24rpx;
    color: #747f93;
}

.footer-line {
    width: 1rpx;
    height: 22rpx;
    background: #c9d1df;
    margin: 0 2rpx 0 4rpx;
}

.footer-hint {
    font-size: 22rpx;
    color: #8f96a6;
}

.create-card {
    background: #fff9f2 !important;
    border: 4rpx dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.create-card:active {
    border-color: #999;
    background: #f9f9f9 !important;
}

.create-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
}

.create-icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-icon {
    width: 100rpx;
    height: 100rpx;
    background: #efe9d7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.create-card:active .create-icon {
    background: #e0e0e0;
    transform: scale(0.95);
}

.create-text {
    color: #999;
    font-size: 28rpx;
    font-weight: 500;
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
    position: relative;
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

.form-container {
    padding: 50rpx 40rpx;
}

.form-item {
    margin-bottom: 46rpx;
}

.form-label {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 20rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.required {
    color: #f44336;
    margin-left: 8rpx;
    font-weight: normal;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 16rpx;
    padding: 0 20rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
}

.input-wrapper:focus-within {
    background: #fff;
    border-color: #4d62ff;
    box-shadow: 0 0 0 4rpx rgba(77, 98, 255, 0.1);
}

.input-wrapper.has-error {
    background: #fff;
    border-color: #f44336;
    box-shadow: 0 0 0 4rpx rgba(244, 67, 54, 0.1);
}

.form-input {
    flex: 1;
    height: 88rpx;
    padding: 0 16rpx;
    font-size: 30rpx;
    color: #333;
    box-sizing: border-box;
    border: none;
    background: transparent;
}

.form-input.is-error {
    color: #f44336;
}

.textarea-wrapper {
    background: #f8f8f8;
    border-radius: 16rpx;
    padding: 18rpx 20rpx 16rpx;
    border: 2rpx solid transparent;
}

.textarea-wrapper:focus-within {
    background: #fff;
    border-color: #4d62ff;
    box-shadow: 0 0 0 4rpx rgba(77, 98, 255, 0.1);
}

.form-textarea {
    width: 100%;
    min-height: 100rpx;
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
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    font-size: 26rpx;
    color: #f44336;
    animation: slideDown 0.3s ease;
}

.form-actions {
    display: flex;
    gap: 30rpx;
    margin-top: 54rpx;
    padding-top: 36rpx;
    border-top: 2rpx solid #f0f0f0;
}

.btn {
    flex: 1;
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.btn-cancel {
    background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
    color: #666;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn-cancel:active {
    background: linear-gradient(135deg, #e8e8e8 0%, #ddd 100%);
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.btn-submit {
    background: linear-gradient(135deg, #4d62ff 0%, #3f57f0 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(77, 98, 255, 0.32);
}

.btn-submit:active {
    background: linear-gradient(135deg, #4158ef 0%, #344be4 100%);
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(77, 98, 255, 0.22);
}

.btn-submit:disabled,
.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-loading {
    background: linear-gradient(135deg, #7f8cff 0%, #707fff 100%) !important;
}

.btn-spinner {
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
}

.spinner-circle-small {
    width: 100%;
    height: 100%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
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

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes card-enter {
    from {
        opacity: 0;
        transform: translateY(12rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (min-width: 760px) {
    .container {
        padding-left: 34rpx;
        padding-right: 34rpx;
    }

    .card-list {
        max-width: 920rpx;
        margin: 0 auto;
        gap: 26rpx;
    }

    .hero {
        max-width: 920rpx;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
