<template>
    <view v-if="visible" class="action-bar">
        <view v-if="actions.includes('copy')" class="action-item" hover-class="action-item-active" @click="handleCopy">
            <t-icon
                name="file"
                :size="iconSize"
                color="#8b8fa3" />
        </view>
        <view v-if="actions.includes('favorite')" class="action-item" hover-class="action-item-active" @click="handleFavorite">
            <uni-icons
                :type="favorited ? 'star-filled' : 'star'"
                :size="iconSize"
                :color="favorited ? '#f5a623' : '#8b8fa3'"
            />
        </view>
        <view v-if="actions.includes('regenerate')" class="action-item" hover-class="action-item-active" @click="handleRegenerate">
            <uni-icons type="reload" :size="iconSize" color="#8b8fa3" />
        </view>
        <view v-if="actions.includes('more')" class="action-item" hover-class="action-item-active" @click="$emit('more')">
            <uni-icons type="more-filled" :size="iconSize" color="#8b8fa3" />
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
    actions: {
        type: Array,
        default: () => ['copy', 'favorite', 'regenerate', 'more']
    }
});

const emit = defineEmits(["copy", "favorite", "regenerate", "more"]);

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
    gap: 8rpx;
    margin-top: 12rpx;
    margin-left: 8rpx;
}

.action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    background: transparent;
    border-radius: 8rpx;
    transition: all 0.2s ease;
}

.action-item-active {
    background: rgba(15, 23, 42, 0.05); /* 淡淡的灰色背景 */
    transform: scale(0.95);
}
</style>
