<template>
    <div>
        <Welcome :style="{ backgroundImage: background, borderStartStartRadius: 4 }"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            :title="title"
            :description="welcomedescription"
            class="welcome-animation" >
            <template #extra>
                <Space>
                    <Button>
                    <template #icon>
                        <EllipsisOutlined />
                    </template>
                    </Button>
                </Space>
            </template>
        </Welcome>
    </div>
</template>
<script setup>
import { Welcome } from 'ant-design-x-vue';
import { theme } from 'ant-design-vue';
import { Button, Space } from 'ant-design-vue';
import {  EllipsisOutlined } from '@ant-design/icons-vue';
import {  computed } from 'vue';
const props = defineProps({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    chooseModelName:{ // 选择模型的名称
        type:String,
    }
});

// 使用computed实现响应式标题
const welcomedescription = computed(() => `${props.description}${props.chooseModelName || ''}`);

// 定义背景样式
const items = [
    {
        algorithm: theme.defaultAlgorithm,
        background: 'linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)',
    },
];
// 提取背景样式
const background = items[0].background;
</script>
<style scoped>
.welcome-animation {
    animation:
        fadeInUp 0.6s ease-out forwards,
        pulse 2s infinite 0.6s;
    /* 0.6s延迟，等淡入动画完成后再开始 */
    opacity: 0;
    transform: translateY(20px);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}
</style>