<template>
    <view class="subsection-wrapper">
        <up-subsection 
        :list="props.list" 
        :mode="props.mode" 
        :current="current"
        @change="handleSubsectionChange"
        :activeColor="props.activeColor"
        :inactiveColor="props.inactiveColor"
        :bgColor="props.bgColor"
        :fontSize="props.fontSize">
    </up-subsection>
    </view>
</template>

<script setup>

// 定义props
const props = defineProps({
    list: {
        type: Array,
        default: () => ['选项01', '选项02']
    },
    current: {
        type: Number,
        default: 0
    },
    mode: {
        type: String,
        default: 'button'
    },
    activeColor: {
        type: String,
        default: '#3c9cff'
    },
    inactiveColor: {
        type: String,
        default: '#303133'
    },
    bgColor: {
        type: String,
        default: '#eeeeef'
    },
    fontSize: {
        type: Number,
        default: 12
    }
});

// 定义emit
const emit = defineEmits(['updateCurrent']);

// 处理切换事件
const handleSubsectionChange = (index) => {
    emit('updateCurrent', index);
};
</script>

<style scoped>
.subsection-wrapper {
    width: 100%;
}
</style>