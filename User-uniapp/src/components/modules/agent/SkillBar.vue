<template>
    <scroll-view
        class="skill-bar"
        scroll-x
        :show-scrollbar="false"
        :enhanced="true"
        :bounces="false"
    >
        <view class="skill-bar-inner">
            <view
                v-for="item in skills"
                :key="item.key"
                class="skill-chip"
                :class="{ 'skill-chip-active': item.key === activeKey }"
                hover-class="skill-chip-hover"
                @click="handleSelect(item)"
            >
                <t-icon
                    v-if="item.icon"
                    :name="item.icon"
                    :size="20"
                    :color="item.key === activeKey ? 'var(--app-brand)' : 'var(--app-text-secondary)'"
                    class="skill-chip-icon"
                />
                <text class="skill-chip-label">{{ item.label }}</text>
            </view>
        </view>
    </scroll-view>
</template>

<script setup>
const props = defineProps({
    skills: {
        type: Array,
        default: () => [],
    },
    activeKey: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['select']);

const handleSelect = (item) => {
    emit('select', item);
};
</script>

<style scoped>
.skill-bar {
    width: 100%;
    white-space: nowrap;
    padding: 0 24rpx;
    box-sizing: border-box;
}

.skill-bar-inner {
    display: inline-flex;
    align-items: center;
    gap: 16rpx;
    padding: 10rpx 0 14rpx;
}

.skill-chip {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    height: 62rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    background: var(--app-bg-container);
    border: 1.5rpx solid var(--app-border);
    box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.04);
    box-sizing: border-box;
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;
}

.skill-chip-hover {
    transform: scale(0.97);
    background: var(--app-bg-secondary);
}

.skill-chip-active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.skill-chip-icon {
    flex-shrink: 0;
}

.skill-chip-label {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    line-height: 1;
    font-weight: 600;
    color: var(--app-text-secondary);
    white-space: nowrap;
}

.skill-chip-active .skill-chip-label {
    color: var(--app-brand);
}
</style>
