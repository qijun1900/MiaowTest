<template>
    <view v-if="visible" class="action-bar">
        <view class="action-item" hover-class="action-item-active" @click="handleCopy">
            <uni-icons type="copy" :size="iconSize" color="#8b8fa3" />
        </view>
        <view class="action-item" hover-class="action-item-active" @click="handleFavorite">
            <uni-icons
                :type="favorited ? 'star-filled' : 'star'"
                :size="iconSize"
                :color="favorited ? '#f59e0b' : '#8b8fa3'"
            />
        </view>
        <view class="action-item" hover-class="action-item-active" @click="handleRegenerate">
            <uni-icons type="reload" :size="iconSize" color="#8b8fa3" />
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    content: {
        type: String,
        default: "",
    },
    favorited: {
        type: Boolean,
        default: false,
    },
    visible: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["copy", "favorite", "regenerate"]);

const iconSize = 20;

const handleCopy = () => {
    if (!props.content) return;
    uni.setClipboardData({
        data: props.content,
        success: () => {
            uni.showToast({ title: "已复制", icon: "none", duration: 1500 });
            emit("copy", props.content);
        },
    });
};

const handleFavorite = () => {
    emit("favorite", !props.favorited);
};

const handleRegenerate = () => {
    emit("regenerate");
};
</script>

<style scoped>
.action-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12rpx;
    margin-top: 20rpx;
}

.action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    background: #ffffff;
    border: 1rpx solid rgba(15, 23, 42, 0.08);
    border-radius: 50%;
    transition: all 0.15s ease;
}

.action-item-active {
    background: #f0f2f5;
    transform: scale(0.985);
}
</style>
