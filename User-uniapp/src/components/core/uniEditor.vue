<template>
    <view class="editor-section">
        <editor 
            class="editor"
            :placeholder="props.placeholder"
            :show-img-size="showImgSize"
            :show-img-toolbar="showImgToolbar"
            :show-img-resize="showImgResize"
            @input="handleInput"
            @ready="handleReady"
        />
    </view>
</template>

<script setup>
import { ref, watch } from 'vue';
// 编辑器实例引用
const editorRef = ref(null);

// 定义组件属性
const props = defineProps({
    // 初始内容
    modelValue: {
        type: String,
        default: ''
    },
    // 占位符文本
    placeholder: {
        type: String,
        default: '请输入内容...'
    },
    // 是否显示图片大小
    showImgSize: {
        type: Boolean,
        default: false
    },
    // 是否显示图片工具栏
    showImgToolbar: {
        type: Boolean,
        default: false
    },
    // 是否显示图片调整大小
    showImgResize: {
        type: Boolean,
        default: false
    },

});

// 定义事件
const emit = defineEmits(['update:modelValue']);

// 处理输入事件
const handleInput = (e) => {
    const html = e.detail.html;
    emit('update:modelValue', html);
};

// 编辑器准备就绪
const handleReady = () => {
    // 编辑器就绪后，如果modelValue有值，设置到编辑器中
    if (props.modelValue) {
        editorRef.value.setContents({ html: props.modelValue });
    }
};

// 监听modelValue变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
    if (editorRef.value && newValue !== undefined) {
        editorRef.value.setContents({ html: newValue });
    }
});

</script>

<style scoped>
.editor-section {
    margin-bottom: 20rpx;
}


.editor {
    width: 100%;
    border: 1px solid #e5e5e5;
    border-radius: 8rpx;
    padding: 20rpx;
    box-sizing: border-box;
}
</style>