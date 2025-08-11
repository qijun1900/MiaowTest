<template>
    <div class="container">
        <div class="sender">
            <EditorSender 
                placeholder="请在此处按照格式正确输入题目内容~"
                :iSshowHeaderFlog="true"
                :iSshowPrefixFlog="true"
                HeaderLeftTitle="💯欢迎使用AI自动录入题目~"
                HeaderSelfWrapclassName="my-header-self-wrap"
                HeaderSelfContentclassName="my-header-self-content">
                <template #HeaderSelfContent>
                    <el-card style="border-radius: 10px" shadow="never">
                        <el-descriptions 
                            :column="4">
                            <el-descriptions-item 
                                label="科目名称">
                            <el-tag type="success">{{ appStore.examInfo.name }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item 
                            label="题目类别" >
                            <el-tag type="warning">{{ getCategoryName(appStore.examInfo.category) }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item 
                            label="题目数量" >
                            <el-tag type="primary">{{ appStore.currentQuestionTotal }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item 
                            label="创建时间">
                            <el-tag type="info">{{ formatTime.getTime2(appStore.examInfo.createdTime) }}</el-tag>
                        </el-descriptions-item>
                        </el-descriptions>
                    </el-card>
                </template>
        </EditorSender>
        </div>
    </div>
</template>
<script setup>
import EditorSender from '../Element-plus-x/EditorSender.vue';
import { useAppStore } from '@/stores';
import {getCategoryName} from '@/util/formatExamname'
import formatTime from '@/util/formatTime'
import { onMounted } from 'vue';

const appStore = useAppStore();
const props = defineProps({
    total: {
    type: Number,
    default: 0
  }
})

onMounted(() => {
    console.log(props.total);
});


</script>
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.sender {
    width: 100%;
    max-width: 1100px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-top: 400px;
}


</style>