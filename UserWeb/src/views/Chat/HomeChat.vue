<template>
    <div class="page-container">
        <TopBack 
            title="喵喵智答"
            navBarIconColor="#000000" 
            navBarBackground="#f9fdff"
           />
           <div>
                <div class="welcome">
                    <AntWelcome 
                    title="你可以向我提问题!"
                    description="基于组件Ant Design X Vue 与百炼大模型服务平台，实现多种大模型自由轻松调用!🐱" />
                </div>
                <div class="prompts" v-show="!PromptsHiden">
                    <AntPrompts  @userpromptsubmit="handleuserPrompt" />
                </div>
                <div class="sender" >
                    <AntSender 
                        @userinputsubmit="handleuserSend" 
                        @isHidePrompts="handleisHidePrompts"
                        @isShowBubble="handleIsloading"/>
                </div>
                <div>
                    <Flex gap="middle" vertical>
                        <div class="userbubble">
                            <AntBubble
                                :content="userSendData"
                                :typingstep="2"
                                :typinginterval="30"
                                v-show="isShowUserBubble">
                                <template #bubbleAvatar>
                                    <TalkUserIcon/>
                                </template>
                            </AntBubble>
                        </div>
                        <div class="aibubble"> 
                            <AntBubble
                                :content="LlaResponse"
                                placement="start"
                                :typingstep="4" 
                                :typinginterval="30" 
                                typingsuffix="😺"
                                v-show="isShowAIBubble">
                                <template #bubbleAvatar>
                                    <TalkAIIcon/>
                                </template>
                            </AntBubble>
                        </div>
                    </Flex>
                </div>
           </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import AntWelcome  from '@/components/FuntionComponents/AntWelcome.vue';
import AntPrompts from '@/components/FuntionComponents/AntPrompts.vue';
import AntSender from '@/components/FuntionComponents/AntSender.vue';
import AntBubble from '@/components/FuntionComponents/AntBubble.vue';
import TalkUserIcon from '@/components/icons/TalkUserIcon.vue';
import TalkAIIcon from '@/components/icons/TalkAIIcon.vue';
import { Flex,} from 'ant-design-vue';

const userSendData = ref('');
const LlaResponse = ref('');
const PromptsHiden = ref(false);
const isShowUserBubble = ref(false);
const isShowAIBubble = ref(false);

//处理用户提交的问题
const handleuserSend = (data) => {
    console.log('用户提交了问题:',data) 
    userSendData.value = data;
}
//处理用户提交的提示词
const handleuserPrompt = (data) => {
    console.log('用户提交了提示词:',data)
    userSendData.value = data; 

}
//处理是否隐藏提示词
const handleisHidePrompts = (data) => {
    PromptsHiden.value = data;
}
//处理是否显示用户气泡
const handleIsloading = (data) => {
    console.log('是否显示用户气泡:',data)
    isShowUserBubble.value = data;
}


</script>
<style scoped>
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f7fcff;
    display: flex;
    flex-direction: column;
}

.welcome{
    margin-top: 5px; 
    margin-left: 13px;
    margin-right: 13px;
    border-radius: 10px;
}
 
.prompts{
    margin-top: 10px;
    margin-left: 18px;
}

.sender {
    position: fixed;  /* 固定定位 */
    bottom: 0;       /* 贴紧底部 */
    left: 0;         /* 左侧对齐 */
    right: 0;        /* 右侧对齐 */
    background-color: #f7fcff;
    padding: 8px 12px;
    z-index: 100;    /* 确保在最上层 */
    transition: transform 0.3s ease;
}
.userbubble{
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;

}



</style>