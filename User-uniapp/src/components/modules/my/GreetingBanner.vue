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
    const greet = greetingInfo.value.text;
    if (!isLoggedIn.value) {
        return `亲爱的用户，${greet}`;
    }

    const nickname = (userInfo.value?.nickname || "").trim();
    if (nickname) {
        return `${nickname}，${greet}`;
    }
    return `第${userInfo.value?.userCount || 0}位哈基米，${greet}`;
});

onMounted(() => {
    // 每60分钟更新一次问候语，保持内容新鲜，同时避免过于频繁的更新导致性能问题。
    timer = setInterval(() => {
        tick.value = Date.now();
    },  60 * 60 * 1000);
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
