<template>
    <view class="agent-uploader" :class="{ 'agent-uploader-readonly': mode === 'readonly' }">
        <view
            v-for="(img, index) in images"
            :key="img.id || index"
            class="image-item"
        >
            <image
                :src="getItemSrc(img)"
                mode="aspectFill"
                class="preview-image"
                @click="handlePreview(index)"
                @error="handleError(index)"
            />

            <!-- 上传中遮罩 -->
            <view v-if="img.status === 'uploading'" class="status-overlay">
                <view class="uploading-spinner" />
            </view>

            <!-- 上传失败遮罩 -->
            <view v-if="img.status === 'failed'" class="status-overlay status-failed" @click.stop="$emit('retry', index)">
                <uni-icons type="refresh" size="22" color="#ffffff" />
                <text class="failed-text">重试</text>
            </view>

            <!-- 删除按钮 -->
            <view
                v-if="mode === 'editable'"
                class="delete-btn"
                @click.stop="$emit('remove', index)"
            >
                <uni-icons type="close" size="12" color="#ffffff" />
            </view>
        </view>

        <!-- 添加按钮 -->
        <view
            v-if="mode === 'editable' && images.length < maxCount"
            class="add-btn"
            @click="handleAdd"
        >
            <view class="add-icon">
                <view class="add-icon-h" />
                <view class="add-icon-v" />
            </view>
        </view>
    </view>
</template>

<script setup>
import { cloudFileToHttpUrl } from "../../../util/cloudFileUrl";

const props = defineProps({
    mode: {
        type: String,
        default: "editable",
        validator: (v) => ["editable", "readonly"].includes(v),
    },
    images: {
        type: Array,
        default: () => [],
    },
    maxCount: {
        type: Number,
        default: 9,
    },
});

const emit = defineEmits(["add", "remove", "retry", "preview"]);

const getItemSrc = (img) => {
    if (!img) return "";
    if (img.status === "uploaded" && img.url) {
        return cloudFileToHttpUrl(img.url);
    }
    if (img.localPath) {
        return img.localPath;
    }
    return cloudFileToHttpUrl(typeof img === "string" ? img : img?.url || "");
};

const handleAdd = () => {
    const remaining = props.maxCount - props.images.length;
    if (remaining <= 0) {
        uni.showToast({ title: `最多上传${props.maxCount}张图片`, icon: "none" });
        return;
    }
    emit("add", remaining);
};

const handlePreview = (index) => {
    const urls = props.images
        .map((img) => {
            if (img.status === "uploaded" && img.url) return cloudFileToHttpUrl(img.url);
            if (img.localPath) return img.localPath;
            return cloudFileToHttpUrl(typeof img === "string" ? img : img?.url || "");
        })
        .filter(Boolean);
    if (!urls.length) return;
    uni.previewImage({ urls, current: urls[index] || urls[0] });
    emit("preview", index);
};

const handleError = (index) => {
    console.warn(`[AgentUploader] 图片加载失败, index: ${index}`);
};
</script>

<style scoped>
.agent-uploader {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    padding: 16rpx 0;
}

.image-item {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background: #f0f2f5;
}

.preview-image {
    width: 100%;
    height: 100%;
}

.status-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
}

.uploading-spinner {
    width: 36rpx;
    height: 36rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.status-failed {
    background: rgba(220, 53, 69, 0.6);
}

.failed-text {
    font-size: 20rpx;
    color: #ffffff;
    margin-top: 4rpx;
}

.delete-btn {
    position: absolute;
    top: 6rpx;
    right: 6rpx;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn {
    width: 140rpx;
    height: 140rpx;
    border-radius: 16rpx;
    border: 2rpx dashed rgba(15, 23, 42, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafbfc;
}

.add-icon {
    width: 40rpx;
    height: 40rpx;
    position: relative;
}

.add-icon-h,
.add-icon-v {
    position: absolute;
    left: 50%;
    top: 50%;
    background: rgba(15, 23, 42, 0.35);
    border-radius: 999rpx;
    transform: translate(-50%, -50%);
}

.add-icon-h {
    width: 28rpx;
    height: 3rpx;
}

.add-icon-v {
    width: 3rpx;
    height: 28rpx;
}

.agent-uploader-readonly .image-item {
    width: 180rpx;
    height: 180rpx;
}
</style>
