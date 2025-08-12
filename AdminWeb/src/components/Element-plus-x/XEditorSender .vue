<template>
    <div class="container">
        <EditorSender  
            ref="senderRef"
            @submit="handleSubmit"
            :placeholder=props.placeholder 
            :auto-focus="props.isFocus"
            :clearable="props.iSclearable">
            <template v-if="showHeader" #header>
                <div :class="props.HeaderSelfWrapclassName">
                    <div :class="['default-header-self-title']">
                        <div class="header-left">{{ props.HeaderLeftTitle }}</div>
                        <div class="header-right">
                            <el-button @click="closeCloseHeader">
                                <el-icon>
                                    <CircleClose />
                                </el-icon>
                                <span>关闭头部</span>
                            </el-button>
                        </div>
                    </div>
                    <div :class="props.HeaderSelfContentclassName">
                        <slot name="HeaderSelfContent"></slot>
                    </div>
                </div>    
            </template>
            <template v-if="props.iSshowPrefixFlog" #prefix>
                <div class="prefix-self-wrap">
                <el-button color="#626aef" 
                    :dark="true" 
                    @click="openCloseHeader">
                    打开/关闭头部
                </el-button>
                </div>
            </template>
        </EditorSender>
    </div>
</template>
<script setup>
import { CircleClose } from '@element-plus/icons-vue';
import { ref } from 'vue';
const senderRef = ref();
const emit = defineEmits(['user-submit']);
const props = defineProps({
    placeholder: {// 编辑器占位符
        type: String,
        default: '💌 欢迎使用 Element-Plus-X ~'
    },
    isFocus: {// 是否自动获取焦点
        type: Boolean,
        default: false
    },
    iSclearable: {// 是否可清空
        type: Boolean,
        default: false
    },
    isShowHeaderFlog: {// 是否显示头部
        type: Boolean,
        default: false
    },
    iSshowPrefixFlog: {// 是否显示前缀
        type: Boolean,
        default: false
    },
    HeaderLeftTitle: {// 头部左侧标题
        type: String,
        default: '💯 欢迎使用 Element Plus X'
    },
    HeaderSelfWrapclassName: {// 自定义类名
        type: String,
        default: 'default-header-self-wrap'
    },
    HeaderSelfContentclassName: {// 自定义类名
        type: String,
        default: 'default-header-self-content'
    }
})
const showHeader = ref(props.isShowHeaderFlog);// 是否显示头部
// 获取编辑器内容的方法
const getEditorContent = () => {
  const content = senderRef.value.getCurrentValue();
    // content 结构示例:
    // {
    //   text: "纯文本内容",
    //   html: "<p>带格式的HTML内容</p>",
    //   tags: ["标签1", "标签2"]
    // 
  return content;
};
const openCloseHeader = () => {
    showHeader.value = !showHeader.value;
};
const closeCloseHeader = () => {
    showHeader.value = false;
};

const handleSubmit = () => {
    const content = getEditorContent();
    showHeader.value = false; // 关闭头部
    emit('user-submit',content); 
};




</script>

<style scoped>
.container{
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

}
.default-header-self-wrap {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 200px;
}
.default-header-self-title {
    width: 100%;
    display: flex;
    height: 30px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
  }
.default-header-self-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #626aef;
    font-weight: 600;
}
.my-header-self-wrap {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 101px;
}
.my-header-self-content{
    font-size: 20px;
    font-weight: 800;
}

.prefix-self-wrap {
  display: flex;
}
</style>