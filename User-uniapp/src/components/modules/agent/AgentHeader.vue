<template>
    <view class="top-wrapper">
        <view class="custom-navbar" :style="customNavbarStyle">
            <view class="nav-row" :style="navRowStyle">
                <view class="nav-left" @click="handleMenuClick">
                    <view class="menu-line line-top"></view>
                    <view class="menu-line line-bottom"></view>
                </view>

                <view class="model-switch" @click="handleModelSwitch">
                    <text class="model-text">{{ currentModel }}</text>
                    <view class="model-arrow"></view>
                </view>

                <view class="nav-right" @click="handleNewChat">
                    <view class="plus-circle">
                        <view class="plus-line plus-horizontal"></view>
                        <view class="plus-line plus-vertical"></view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from "vue";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";

const props = defineProps({
    modelList: {
        type: Array,
        default: () => ["Sonnet 4.6", "DeepSeek R1", "Qwen Max"],
    },
    initialModel: {
        type: String,
        default: "Sonnet 4.6",
    },
});

const emit = defineEmits(["menu-click", "new-chat", "model-change"]);

const currentModel = ref(props.initialModel);

const { customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

const handleMenuClick = () => {
    emit("menu-click");
};

const handleModelSwitch = () => {
    if (!props.modelList?.length) {
        return;
    }

    uni.showActionSheet({
        itemList: props.modelList,
        success: (result) => {
            const selectedModel = props.modelList[result.tapIndex];
            if (!selectedModel) {
                return;
            }
            currentModel.value = selectedModel;
            emit("model-change", selectedModel);
        },
    });
};

const handleNewChat = () => {
    emit("new-chat");
};
</script>

<style scoped>
.top-wrapper {
    position: relative;
    z-index: 10;
    background: #f6f7f9;
}

.custom-navbar {
    background: #f6f7f9;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.08);
    box-sizing: border-box; 
}

.nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
}

.nav-left,
.nav-right {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-left {
    width: 76rpx;
    flex-direction: column;
    gap: 8rpx;
}

.nav-right {
    width: 92rpx;
}

.menu-line {
    height: 4rpx;
    border-radius: 4rpx;
    background: #30323a;
}

.line-top {
    width: 30rpx;
}

.line-bottom {
    width: 20rpx;
}

.model-switch {
    max-width: 420rpx;
    height: 64rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    background: rgba(255, 255, 255, 0.72);
    border: 1rpx solid rgba(15, 23, 42, 0.1);
}

.model-text {
    font-size: 34rpx;
    font-weight: 600;
    color: #2d2f36;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.model-arrow {
    width: 12rpx;
    height: 12rpx;
    border-right: 3rpx solid #72788a;
    border-bottom: 3rpx solid #72788a;
    transform: rotate(45deg) translateY(-2rpx);
}

.plus-circle {
    width: 58rpx;
    height: 58rpx;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #f0f3f8 100%);
    border: 1.6rpx solid rgba(39, 47, 66, 0.2);
    box-shadow:
        0 6rpx 14rpx rgba(30, 42, 62, 0.14),
        inset 0 2rpx 4rpx rgba(255, 255, 255, 0.95);
    transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.plus-circle::before {
    content: "";
    position: absolute;
    left: 10rpx;
    top: 8rpx;
    width: 26rpx;
    height: 14rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.75);
}

.plus-circle::after {
    content: "";
    position: absolute;
    inset: 3rpx;
    border-radius: 50%;
    border: 1rpx solid rgba(255, 255, 255, 0.7);
}

.plus-line {
    position: absolute;
    left: 50%;
    top: 50%;
    background: linear-gradient(180deg, #31384a 0%, #1f2635 100%);
    border-radius: 999rpx;
    box-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.35);
    transform: translate(-50%, -50%);
}

.plus-horizontal {
    width: 24rpx;
    height: 4rpx;
}

.plus-vertical {
    width: 4rpx;
    height: 24rpx;
}

.nav-right:active .plus-circle {
    transform: scale(0.94);
    box-shadow:
        0 3rpx 8rpx rgba(30, 42, 62, 0.18),
        inset 0 1rpx 2rpx rgba(255, 255, 255, 0.88);
}
</style>