<template>
    <view class="subsection-wrapper">
        <view
            class="subsection"
            :style="{ backgroundColor: props.bgColor, fontSize: props.fontSize + 'px' }"
        >
            <view
                v-for="(item, index) in props.list"
                :key="index"
                class="subsection-item"
                :class="{ active: currentActive === index }"
                :style="{
                    color: currentActive === index ? '#ffffff' : props.inactiveColor,
                    backgroundColor: currentActive === index ? props.activeColor : 'transparent',
                }"
                @click="handleClick(index)"
            >
                <text>{{ typeof item === 'string' ? item : item.name }}</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    list: {
        type: Array,
        default: () => ["选项01", "选项02"],
    },
    current: {
        type: Number,
        default: undefined,
    },
    mode: {
        type: String,
        default: "button",
    },
    activeColor: {
        type: String,
        default: "var(--app-brand)",
    },
    inactiveColor: {
        type: String,
        default: "var(--app-text-primary)",
    },
    bgColor: {
        type: String,
        default: "var(--app-bg-secondary)",
    },
    fontSize: {
        type: Number,
        default: 12,
    },
});

const emit = defineEmits(["updateCurrent"]);

const activeIndex = ref(props.current ?? 0);

watch(
    () => props.current,
    (val) => {
        if (val !== undefined) activeIndex.value = val;
    },
);

const currentActive = computed(() =>
    props.current !== undefined ? props.current : activeIndex.value,
);

const handleClick = (index) => {
    if (currentActive.value === index) return;
    activeIndex.value = index;
    uni.vibrateShort({ type: "light" });
    emit("updateCurrent", index);
};
</script>

<style scoped>
.subsection-wrapper {
    width: 100%;
}

.subsection {
    display: flex;
    border-radius: 12rpx;
    padding: 4rpx;
    gap: 4rpx;
    background-color: var(--app-bg-secondary);
}

.subsection-item {
    flex: 1;
    text-align: center;
    padding: 10rpx 6rpx;
    border-radius: 10rpx;
    transition: all 0.25s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    line-height: 1.4;
}

.subsection-item.active {
    font-weight: 600;
    box-shadow: 0 2rpx 6rpx rgba(60, 156, 255, 0.3);
}
</style>
