<template>
    <t-popup
        :visible="visible"
        placement="center"
        :close-on-overlay-click="showCancel"
        :overlay="true"
        :z-index="19999"
        @visible-change="onVisibleChange"
    >
        <view class="update-dialog">
            <view class="dialog-title">{{ title }}</view>
            <view class="dialog-content">
                <text class="dialog-text">{{ content }}</text>
            </view>
            <view class="dialog-actions">
                <view v-if="showCancel" class="btn-cancel" hover-class="btn-active" @click="handleCancel">
                    <text class="btn-cancel-text">{{ cancelText }}</text>
                </view>
                <view class="btn-confirm" hover-class="btn-active" @click="handleConfirm">
                    <text class="btn-confirm-text">{{ confirmText }}</text>
                </view>
            </view>
        </view>
    </t-popup>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const title = ref("");
const content = ref("");
const confirmText = ref("确定");
const cancelText = ref("取消");
const showCancel = ref(true);
let currentId = null;

const onVisibleChange = (ctx) => {
    if (!ctx.visible && showCancel.value) {
        handleCancel();
    }
};

const handleConfirm = () => {
    visible.value = false;
    uni.$emit(`updateModalResult:${currentId}`, { confirm: true });
};

const handleCancel = () => {
    visible.value = false;
    uni.$emit(`updateModalResult:${currentId}`, { confirm: false });
};

uni.$on("showUpdateModal", (payload) => {
    currentId = payload.id;
    title.value = payload.title || "";
    content.value = payload.content || "";
    confirmText.value = payload.confirmText || "确定";
    cancelText.value = payload.cancelText || "取消";
    showCancel.value = payload.showCancel !== false;
    visible.value = true;
});
</script>

<style scoped>
.update-dialog {
    width: 580rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    padding: 48rpx 40rpx 32rpx;
}

.dialog-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 24rpx;
}

.dialog-content {
    margin-bottom: 40rpx;
}

.dialog-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
}

.dialog-actions {
    display: flex;
    gap: 24rpx;
}

.btn-cancel {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 16rpx;
}

.btn-cancel-text {
    font-size: 30rpx;
    color: #999;
}

.btn-confirm {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4d94ff, #357ae0);
    border-radius: 16rpx;
}

.btn-confirm-text {
    font-size: 30rpx;
    color: #fff;
    font-weight: bold;
}

.btn-active {
    opacity: 0.75;
    transform: scale(0.97);
}
</style>
