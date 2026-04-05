<template>
    <view class="greeting-banner" :style="bannerStyle">
        <text class="greeting-title">{{ displayText }}</text>
    </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getGreetingInfo } from "../../../util/greet";
import { UserInfoStore } from "../../../stores/modules/UserinfoStore";

const props = defineProps({
    statusBarHeight: {
        type: Number,
        default: 0,
    },
    topInset: {
        type: Number,
        default: 8,
    },
});

const tick = ref(Date.now());
let timer = null;
const userInfoStore = UserInfoStore();

const bannerStyle = computed(() => ({
    marginTop: `${(props.statusBarHeight || 0) + (props.topInset || 0)}px`,
}));

const greetingInfo = computed(() => {
    tick.value;
    return getGreetingInfo();
});

const isLoggedIn = computed(() => userInfoStore.isLoggedIn);
const userInfo = computed(() => userInfoStore.userInfo);

const displayText = computed(() => {
    if (!isLoggedIn.value) {
        return `亲爱的用户，${greetingInfo.value.text}`;
    }

    return userInfo.value?.nickname + `，${greetingInfo.value.text}` || `第${userInfo.value?.userCount || 0}位哈基米` + `，${greetingInfo.value.text}`;
});

onMounted(() => {
    // 每分钟刷新一次，保证跨时间段时问候语自动更新
    timer = setInterval(() => {
        tick.value = Date.now();
    }, 60000);
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});
</script>

<style scoped>
.greeting-banner {
    position: relative;
    z-index: 10000;
    margin: 0 24rpx 8rpx 24rpx;
    padding: 8rpx 0;
}

.greeting-title {
    font-size: 30rpx;
    line-height: 1.5;
    font-weight: 600;
    color: rgba(24, 53, 88, 0.62);
}
</style>
