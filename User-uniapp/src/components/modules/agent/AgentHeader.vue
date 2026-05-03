<template>
    <view class="top-wrapper" :style="topWrapperStyle">
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

                <view class="nav-right">
                    <view class="more-trigger" @click.stop="toggleOptionsMenu">
                        <view class="more-dot"></view>
                        <view class="more-dot"></view>
                        <view class="more-dot"></view>
                    </view>

                    <!-- 遮罩层，用于点击外部关闭菜单 -->
                    <view v-if="showOptionsMenu" class="options-mask" @click.stop="closeOptionsMenu"></view>
                    
                    <!-- 下拉菜单 -->
                    <view v-if="showOptionsMenu" class="options-dropdown" @click.stop>
                        <view class="option-item" @click="handleOption('rename')">
                            <text class="option-text">Rename</text>
                            <uni-icons type="compose" size="18" color="#333"></uni-icons>
                        </view>
                        <view class="option-item" @click="handleOption('star')">
                            <text class="option-text">Star</text>
                            <uni-icons type="star" size="18" color="#333"></uni-icons>
                        </view>
                        <view class="option-item option-item-danger" @click="handleOption('delete')">
                            <text class="option-text">Delete</text>
                            <uni-icons type="trash" size="18" color="#ef4444"></uni-icons>
                        </view>
                        <view class="dropdown-divider"></view>
                        <view class="option-item" @click="handleOption('new-chat')">
                            <text class="option-text">New chat</text>
                            <uni-icons type="plusempty" size="18" color="#333"></uni-icons>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";

const props = defineProps({
    modelList: { //Agent列表，格式为[{ label: "Agent名称", value: "AgentKey" }]
        type: Array,
        default: () => [""],
    },
    initialModel: {
        type: String,
        default: "暂时无模型",
    },
});

const emit = defineEmits(["menu-click", "new-chat", "model-change", "option-click"]);

const currentModel = ref(props.initialModel);
const showOptionsMenu = ref(false);

watch(() => props.initialModel, (newVal) => {
    currentModel.value = newVal;
});

const { navBarInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

const topWrapperStyle = computed(() => ({
    height: `${navBarInfo.value.totalHeight}px`,
}));

const handleMenuClick = () => {
    emit("menu-click");
};

const handleModelSwitch = () => {
    if (!props.modelList?.length) {
        return;
    }

    const itemNames = props.modelList.map(item => typeof item === 'object' ? item.label : item);

    uni.showActionSheet({
        itemList: itemNames,
        success: (result) => {
            const selectedModel = props.modelList[result.tapIndex];
            if (!selectedModel) {
                return;
            }
            
            if (typeof selectedModel === 'object') {
                currentModel.value = selectedModel.label;
                emit("model-change", selectedModel.label, selectedModel.value);//name和key都传出去，方便外层使用
            } else {
                currentModel.value = selectedModel;
                emit("model-change", selectedModel, selectedModel);
            }
        },
    });
};

const handleNewChat = () => {
    emit("new-chat");
};

const toggleOptionsMenu = () => {
    showOptionsMenu.value = !showOptionsMenu.value;
};

const closeOptionsMenu = () => {
    showOptionsMenu.value = false;
};

const handleOption = (action) => {
    closeOptionsMenu();
    if (action === 'new-chat') {
        handleNewChat();
    } else {
        emit("option-click", action);
    }
};
</script>

<style scoped>
.top-wrapper {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    background: #f6f7f9;
    box-sizing: border-box;
}

.custom-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
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

.nav-right {
    position: relative;
    width: 60rpx;
    display: flex;
    justify-content: flex-end;
}

.more-trigger {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
}

.more-trigger:active {
    opacity: 0.7;
}

.more-dot {
    width: 8rpx;
    height: 8rpx;
    background-color: #30323a;
    border-radius: 50%;
}

.options-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
}

.options-dropdown {
    position: absolute;
    top: 90rpx;
    right: 0;
    width: 320rpx;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 10rpx 0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
    z-index: 101;
    display: flex;
    flex-direction: column;
}

.option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 30rpx;
}

.option-item:active {
    background-color: #f7f8f9;
}

.option-text {
    font-size: 30rpx;
    color: #333;
}

.option-item-danger .option-text {
    color: #ef4444; 
}

.dropdown-divider {
    height: 1rpx;
    background-color: #f0f0f0;
    margin: 8rpx 0;
}
</style>
