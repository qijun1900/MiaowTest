<template>
    <div>
        <Sender
            ref="senderRef"
            v-model:value="userinput"
            :loading="loading"
            :auto-size="{ minRows: 1, maxRows: 6 }"
            @submit="handleUserInput()"
            @cancel="handleCancel()"
            @focus="handleFocus()"
            placeholder="例如你可以问我：你是什么模型？"
        />
    </div>
</template>
<script setup>
import { Sender } from 'ant-design-x-vue'
import  {ref} from 'vue'

const loading = ref(false)
const userinput = ref('')
const isShowBubble = ref(false)
const senderRef = ref(null)  // 新增 Sender 组件引用


const emit = defineEmits(['userinputsubmit','isHidePrompts','isShowBubble'])

const handleUserInput = () => {
    emit('userinputsubmit', userinput.value)
    userinput.value = ''
    loading.value = true
    isShowBubble.value = true
    emit('isShowBubble', isShowBubble.value)
    senderRef.value?.blur() //提交后收起键盘
}

const handleCancel = () => { 
    userinput.value = ''
    loading.value = false
}
const handleFocus = () => {
    emit('isHidePrompts', true)
}



// 暴露重置loading方法
const resetLoading = () => {
    loading.value = false;
};

defineExpose({
    resetLoading
});
</script>
<style scoped>
</style>