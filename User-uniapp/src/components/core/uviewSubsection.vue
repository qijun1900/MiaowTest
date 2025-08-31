<template>
    <view class="subsection-wrapper">
        <up-subsection 
        :list="props.list" 
        mode="button" 
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
    }
});

// 定义emit
const emit = defineEmits(['update:current']);

// 处理切换事件
const handleSubsectionChange = (index) => {
    emit('update:current', index);
};
</script>

<style scoped>
.subsection-wrapper {
    width: 40%; /* 控制分段控制器的宽度 */
    margin: 0 auto; /* 居中显示 */
}
</style>