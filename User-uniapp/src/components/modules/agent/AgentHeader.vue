<template>
    <view class="top-wrapper" :style="topWrapperStyle">
        <!-- 导航栏底沿向下的渐变模糊带：让内容滚到导航栏下方时呈现淡出/磨砂效果 -->
        <view class="header-fade-mask" :style="fadeMaskStyle"></view>
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
                    <view v-if="conversationTitle" class="more-trigger" @click.stop="toggleOptionsMenu">
                        <view class="more-dot"></view>
                        <view class="more-dot"></view>
                        <view class="more-dot"></view>
                    </view>

                    <!-- 遮罩层，用于点击外部关闭菜单 -->
                    <view v-if="showOptionsMenu" class="options-mask" @click.stop="closeOptionsMenu"></view>
                    
                    <!-- 下拉菜单 -->
                    <view v-if="showOptionsMenu" class="options-dropdown" @click.stop>
                        <view class="dropdown-header" v-if="conversationTitle">
                            <text class="dropdown-title">{{ conversationTitle }}</text>
                        </view>
                        <view class="dropdown-divider" v-if="conversationTitle"></view>
                        
                        <view class="option-item" @click="handleOption('rename')">
                            <text class="option-text">重命名</text>
                            <uni-icons type="compose" size="18" color="#333"></uni-icons>
                        </view>
                        <view class="option-item" @click="handleOption('star')">
                            <text class="option-text">{{ favorited ? '取消收藏' : '收藏' }}</text>
                            <uni-icons :type="favorited ? 'star-filled' : 'star'" size="18" :color="favorited ? '#f5a623' : '#333'"></uni-icons>
                        </view>
                        <view class="option-item option-item-danger" @click="handleOption('delete')">
                            <text class="option-text">删除</text>
                            <uni-icons type="trash" size="18" color="#ef4444"></uni-icons>
                        </view>
                        <view class="dropdown-divider"></view>
                        <view class="option-item" @click="handleOption('new-chat')">
                            <text class="option-text">新建会话</text>
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
    conversationTitle: {
        type: String,
        default: "",
    },
    favorited: {
        type: Boolean,
        default: false,
    }
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

const fadeMaskStyle = computed(() => ({
    top: `${navBarInfo.value.totalHeight}px`,
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
    /* 半透明背景 + 毛玻璃滤镜：在支持 backdrop-filter 的环境下让下方内容直接模糊 */
    background: rgba(246, 247, 249, 0.82);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    box-sizing: border-box;
}

/* 导航栏底部渐变模糊带 —— 即便宿主不支持 backdrop-filter，也能营造清晰→模糊的过渡视觉 */
.header-fade-mask {
    position: fixed;
    left: 0;
    right: 0;
    height: 32rpx;
    z-index: 99;
    pointer-events: none;
    background: linear-gradient(
        to bottom,
        rgba(246, 247, 249, 0.95) 0%,
        rgba(246, 247, 249, 0.6) 45%,
        rgba(246, 247, 249, 0) 100%
    );
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

.dropdown-header {
    padding: 16rpx 30rpx 4rpx;
}

.dropdown-title {
    font-size: 26rpx;
    color: #8b8fa3;
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
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
