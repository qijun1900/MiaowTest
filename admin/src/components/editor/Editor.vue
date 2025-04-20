<template>
    <div id="myeditor">   
    </div>
</template>
<script setup>
import { onMounted ,defineEmits,defineProps,watch} from 'vue';
import E from 'wangeditor'
const emit = defineEmits(["event"])
const props = defineProps({
    content: String
})
let editor = null;

onMounted(() => {
    editor = new E('#myeditor')
    editor.config.placeholder = '请输入正确答案'
    editor.create()
    props.content && editor.txt.html(props.content)
    editor.config.onchange = function (newHtml) {
        emit("event", newHtml)
    }
})

watch(() => props.content, (newVal) => {
    if (editor && newVal === '') {
        editor.txt.html('')  // 修改为 html('') 确保清空更彻底
    }
});
</script>

  
