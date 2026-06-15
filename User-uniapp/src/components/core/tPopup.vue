<template>
    <t-popup
        :visible="show"
        @visible-change="onVisibleChange"
        :placement="props.mode === 'bottom' ? 'bottom' : props.mode === 'top' ? 'top' : 'center'"
        :close-on-overlay-click="closeOnClickOverlay"
        :show-overlay="overlay"
        :z-index="11500"
        :close-btn="closeable"
    >
        <view class="answer-sheet-popup" :style="bgColor ? { backgroundColor: bgColor } : {}">
            <!-- 标题区域 -->
            <view class="popup-header" v-if="title">
                <text class="popup-title">{{ title }}</text>
            </view>

            <!-- 内容区域 -->
            <view class="popup-content">
                <slot name="popupcontent"></slot>
            </view>
        </view>
    </t-popup>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        default: "bottom",
    },
    round: {
        type: Number,
        default: 10,
    },
    closeable: {
        type: Boolean,
        default: true,
    },
    closeOnClickOverlay: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: "",
    },
    overlay: {
        type: Boolean,
        default: true,
    },
    bgColor: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["update:show", "close"]);

const onVisibleChange = (context) => {
    if (!context.visible) {
        emit("update:show", false);
        emit("close");
    }
};
</script>

<style scoped>
.answer-sheet-popup {
    padding: 20rpx;
    min-height: 200rpx;
    max-height: 70vh;
    width: 100vw;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: var(--app-bg-container);
    border-radius: 20rpx 20rpx 0 0;
    overflow: hidden;
}

.popup-header {
    padding: 10rpx 0;
    text-align: center;
    border-bottom: 1px solid var(--app-border);
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: var(--app-text-primary);
}

.popup-content {
    flex: 1;
    padding: 20rpx 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.popup-content::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
    background: transparent;
}

.popup-content {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
