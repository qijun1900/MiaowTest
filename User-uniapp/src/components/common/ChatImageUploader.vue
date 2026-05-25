<template>
    <view class="chat-image-uploader" :class="{ 'chat-image-uploader-readonly': mode === 'readonly' }">
        <view
            v-for="(img, index) in images"
            :key="getImageUrl(img) + index"
            class="image-item"
        >
            <image
                :src="getImageUrl(img)"
                mode="aspectFill"
                class="preview-image"
                @click="handlePreview(index)"
                @error="handleError(index)"
            />
            <view
                v-if="mode === 'editable'"
                class="delete-btn"
                @click.stop="handleRemove(index)"
            >
                <uni-icons type="close" size="12" color="#ffffff" />
            </view>
        </view>

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
import { cloudFileToHttpUrl } from "../../util/cloudFileUrl";

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

const emit = defineEmits(["add", "remove", "preview"]);

const getImageUrl = (img) => {
    if (!img) return "";
    const url = typeof img === "object" && img.url ? img.url : img;
    return cloudFileToHttpUrl(url);
};

const handleAdd = () => {
    const remaining = props.maxCount - props.images.length;
    if (remaining <= 0) {
        uni.showToast({ title: `最多上传${props.maxCount}张图片`, icon: "none" });
        return;
    }
    emit("add", remaining);
};

const handleRemove = (index) => {
    uni.showModal({
        title: "提示",
        content: "确定删除这张图片吗？",
        success: (res) => {
            if (res.confirm) {
                emit("remove", index);
            }
        },
    });
};

const handlePreview = (index) => {
    const urls = props.images
        .map((img) => getImageUrl(img))
        .filter(Boolean);
    if (!urls.length) return;
    uni.previewImage({ urls, current: urls[index] || urls[0] });
    emit("preview", index);
};

const handleError = (index) => {
    console.warn(`[ChatImageUploader] 图片加载失败, index: ${index}`);
};
</script>

<style scoped>
.chat-image-uploader {
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

.chat-image-uploader-readonly .image-item {
    width: 180rpx;
    height: 180rpx;
}
</style>
