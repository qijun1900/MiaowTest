<template>
    <div class="page-container">
        <TopBack 
            title="喵喵智答"
            navBarIconColor="#000000" 
            navBarBackground="#f9fdff">
            <template #chooseBut>
                <van-button 
                    type="primary" 
                    plain
                    color="#626aef"
                    size="small"
                    @click="handelChooseModel">
                    选择对话模型
                </van-button>
            </template>
        </TopBack> 
        <div>
            <div class="welcome">
                <AntWelcome
                :chooseModelName="selectedValues[0]"
                title="你可以向我提问题!"
                description="基于组件Ant Design X Vue 与百炼大模型服务平台，实现多种大模型自由轻松调用!🐱当前选择对话模型：" />
            </div>
            <div class="prompts" v-show="!PromptsHiden">
                <AntPrompts 
                    title="✨使用请注意以下下问题："
                />
            </div>
            <div class="sender" >
                <AntSender 
                    ref="antSender"
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
                            :header="modelName"
                            :content="LlaResponse"
                            placement="start"
                            :typingstep="4" 
                            :typinginterval="30" 
                            typingsuffix="😺"
                            v-show="isShowAIBubble"
                            :loading="isAIloading">
                            <template #bubbleAvatar>
                                <TalkAIIcon/>
                            </template>
                        </AntBubble>
                    </div>
                </Flex>
            </div>
        </div>
        <div>
            <van-popup 
            v-model:show="showPicker" 
            round 
            position="bottom"
            :style="{height:'50%'}">
                <van-picker
                    title="模型列表"
                    v-model="selectedValues"
                    :columns="modelOtions"
                    @cancel="showPicker = false"
                    @confirm="handelConfirm"/>
            </van-popup>
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
import { Flex} from 'ant-design-vue';
import postUserUserChat from '@/API/postUserChat';

const userSendData = ref('');
const LlaResponse = ref('');
const PromptsHiden = ref(false);
const isShowUserBubble = ref(false);
const isShowAIBubble = ref(false);
const isAIloading = ref(true);
const antSender = ref(null); // 添加AntSender组件引用，用于重置loading状态
const modelName = ref(''); // 新增模型名称变量
const showPicker = ref(false); // 新增弹出框显示状态变量
const modelOtions = [ // 新增选项数据,后面由后端请求后返回，而不是写死
    { text: '通义千问-Plus', value: 'qwen-plus' },
    { text: '通义千问-Plus-Latest', value: 'qwen-plus-latest' },
    { text: '通义千问-Plus-2025-04-28', value: 'qwen-plus-2025-04-28' },
    { text: 'DeepSeek-R1', value: 'deepseek-r1' },
    { text: 'DeepSeek-V3', value: 'deepseek-v3' },
    { text: 'DeepSeek-R1-0528', value: 'deepseek-r1-0528' },
]
const selectedValues = ref(['通义千问-Plus']);
const selectedmodelvalue = ref('qwen-plus'); // 新增选择的模型值变量,默认选择通义千问-Plus
//处理用户提交的问题
const handleuserSend = (data) => {
    LlaResponse.value = ''; // 清空之前的回复
    isAIloading.value = true; // 强制进入加载状态
    userSendData.value = data;// 保存用户输入的问题
    console.log('用户提交的问题:',data,selectedmodelvalue.value)
    sendRequest(data,selectedmodelvalue.value)
}
//处理用户提交的提示词
// const handleuserPrompt = (data) => {
    // console.log('用户提交了提示词:',data)
    // userSendData.value = data; 
    // isShowUserBubble.value = true;
//}

//处理是否隐藏提示词
const handleisHidePrompts = (data) => {
    PromptsHiden.value = data;
}

//处理是否显示气泡
const handleIsloading = (data) => {
    isShowUserBubble.value = data;
    isShowAIBubble.value = data;
}
// 处理功能按钮点击事件
const handelChooseModel = () => {
    showPicker.value = true; // 显示弹出框
}
// 处理确认选择事件,选择模型后，关闭弹出框
const handelConfirm = (data) => {
    console.log('选择的模型:', data.selectedOptions[0]);
    showPicker.value = false;
    selectedValues.value = [data.selectedOptions[0].text]; // 保持数组形式
    modelName.value = data.selectedOptions[0].text; // 更新模型名称
    selectedmodelvalue.value = data.selectedOptions[0].value; // 保存选择的模型值
}

//发送请求到服务器
const sendRequest = async (data,model) => {
    try {
        const response = await postUserUserChat(data,model);
        console.log('返回的内容:',response)
        if (response.code === 200) {
            LlaResponse.value = response.data.Aidata;
            modelName.value = response.data.modelName;
            isShowAIBubble.value = true;
        } else {
            LlaResponse.value = '服务器繁忙，请稍后重试！';
        }
    } catch (error) {
        LlaResponse.value = '请求异常，请检查网络';
        console.error('API请求错误:', error);
    }finally {
        isAIloading.value = false;
        antSender.value?.resetLoading();
    }
}

</script>

<style scoped>
.page-container {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh; /* 新增视口高度 */
    background-color: #f7fcff;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* 启用垂直滚动 */
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
.aibubble{
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px; 
    margin-bottom: 100px;
}



</style>