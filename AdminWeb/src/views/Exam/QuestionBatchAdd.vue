<template>
    <div class="container">
            <XWelcome 
                v-show="!isSendValue"
                title="欢迎使用AI智能录题，可大量向该科目改题型下添加题目！"
                extra="当前对话模型："/>
        <div :class="isSendValue ? 'active-sender':'default-sender'">
            <XEditorSender
                @user-submit="handleUserSend"
                placeholder="请在此处输入内容~"
                :isShowHeaderFlog="true"
                :iSshowPrefixFlog="true"
                :iSclearable="true"
                HeaderLeftTitle="💯当前科目及其题目信息~"
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
            </XEditorSender>
        </div>
        <div 
            class="chat-container"  
            v-show="isSendValue">
            <div v-for="(message,index) in chatHistory" :key="index" class="message-wrapper">
                <XBubble
                    :content="message.content"
                    :placement="message.role === 'user' ?'end': 'start'"
                    :bubbleHeaderTitle="message.role === 'user' ? appStore.userInfo.username : message.role"
                    :isLoading="message.isLoading || false"
                />
            </div>
        </div>
    </div>
</template>
<script setup>
import XEditorSender  from '@/components/Element-plus-x/XEditorSender .vue';
import { useAppStore } from '@/stores';
import {getCategoryName} from '@/util/formatExamname'
import formatTime from '@/util/formatTime'
import { onMounted ,ref} from 'vue';
import XWelcome from '@/components/Element-plus-x/XWelcome.vue';
import XBubble from '@/components/Element-plus-x/XBubble.vue';
import { testModelAppAPI } from '@/API/LLM/modelappAPI';

const appStore = useAppStore();
const isSendValue = ref(false);
const chatHistory = ref([]);
const isLoading = ref(false);

const handleUserSend = async (data) => {
    if(data){
        // 添加用户消息
        chatHistory.value.push({role: 'user', content: data.text});
        isSendValue.value = true;
        
        // 立即添加一个 loading 状态的 AI 消息
        chatHistory.value.push({
            role: 'AI助手',
            content: '正在思考中...',
            isLoading: true
        });

        //  AI 回复的过程
        isLoading.value = true;
        try {
            console.log(chatHistory.value)
            const response = await testModelAppAPI(chatHistory.value); 
            console.log(response)
            if(response.code===200){
                // 成功获取 AI 回复后更新消息
                chatHistory.value[chatHistory.value.length - 1] = {// 直接修改最后一个消息
                    role:response.data.modelName,
                    content: response.data,
                    isLoading: false
                };
            }
        } catch (error) {
            console.error('获取 AI 回复失败:', error);
            // 发生错误时更新消息
            chatHistory.value[chatHistory.value.length - 1] = {
                role: 'assistant',
                content: '抱歉，获取回复时出现错误',
                isLoading: false
            };
        } finally {
            isLoading.value = false;
        }
    }
}

onMounted(() => {
  
});


</script>
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
}


.default-sender{
    width: 100%;
    max-width: 1100px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-top: 30px;
}
.active-sender{
    width: 100%;
    max-width: 1100px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: fixed;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
}

.chat-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    height: calc(100vh - 170px);
    overflow-y: auto;
    margin-bottom: 90px;
}


</style>