<template>
    <view class="subsection-wrapper">
        <up-subsection 
        :list="props.list" 
        :mode="props.mode" 
        :current="current"
        @change="handleSubsectionChange">
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

</style>