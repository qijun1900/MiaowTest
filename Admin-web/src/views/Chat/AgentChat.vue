<template>
  <div class="container">
    <XWelcome
      v-show="!isSendValue"
      icon="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      title="欢迎配置测试 ~！"
      :extra="`当前目标：${selectedAgent || '请选择 Agent'}`"
      :description="
        agentOptions.find((option) => option.value === selectedAgent)?.description || ''
      "
    />
    <div :class="isSendValue ? 'active-sender' : 'default-sender'">
      <XEditorSender
        ref="editorRef"
        @user-submit="handleUserSend"
        placeholder="请在此处输入内容~"
        :iSclearable="true"
        :isSenderloading="isSenderloading"
        :iSshowPrefixFlog="true"
        :isShowHeaderFlog="false"
      >
        <template #sender-prefix>
          <ElSelect
            placeholder="选择测试Agent"
            v-model="selectedAgent"
            :options="agentOptions"
            selectWith="160px"
          />
        </template>
      </XEditorSender>
    </div>
    <div class="chat-container" v-show="isSendValue">
      <div v-for="(message, index) in chatHistory" :key="index" class="message-wrapper">
        <XBubble
          :content="message.content"
          :placement="message.role === 'user' ? 'end' : 'start'"
          :bubbleHeaderTitle="message.role === 'user' ? appStore.userInfo.username : message.role"
          :isLoading="message.isLoading || false"
          :bubbleAvatarSrc="
            message.role === 'user'
              ? (appStore.userInfo.avatar ? formatImageUrl(appStore.userInfo.avatar) : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
              : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          "
          :typingsteps="4"
          :typinginterval="30"
          typingsuffix="💩"
          :isFog="true"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import XEditorSender from "@/components/ai/XEditorSender.vue";
import { useAppStore } from "@/stores";
import { onMounted, ref } from "vue";
import XWelcome from "@/components/ai/XWelcome.vue";
import XBubble from "@/components/ai/XBubble.vue";
import formatImageUrl from "@/util/formatImageUrl";
import { testChatAPI, getChatAgents } from "@/API/LLM/agentAPI";
import ElSelect from "@/components/base/BaseSelect.vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";

const appStore = useAppStore();
const isSendValue = ref(false); 
const chatHistory = ref([]); 
const editorRef = ref(); 
const isSenderloading = ref(false); 
const selectedAgent = ref(""); 
const agentOptions = ref([]); 

const FetchAgentList = async () => {
  try {
    const response = await getChatAgents();
    if (response.code === 200) {
      agentOptions.value = response.data.map((item) => ({
        value: item.agentKey,
        label: item.agentName,
        description: item.description,
      }));
    }
  } catch (error) {
    console.error("Error fetching chat agents:", error);
  }
};

const handleUserSend = async (data) => {
  console.log("[AgentChat] handleUserSend data:", data);
  if(!selectedAgent.value) {
    ElMessage.warning("请先选择一个 Agent 进行测试");
    isSenderloading.value = false;
    return;
  }
  if (data) {
    chatHistory.value.push({ role: "user", content: data.text });
    isSenderloading.value = true;
    editorRef.value?.clearContent();
    isSendValue.value = true;

    chatHistory.value.push({
      role: "AI助手",
      content: "正在思考中...",
      isLoading: true,
    });

    try {
      const response = await testChatAPI(
        chatHistory.value.slice(0, -1), // 不带上“正在思考中”这条
        selectedAgent.value
      );
      if (response.code === 200) {
        chatHistory.value[chatHistory.value.length - 1] = {
          role: response.data.modelName || 'AI响应',
          content: response.data.reply,
          isLoading: false,
        };
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      chatHistory.value[chatHistory.value.length - 1] = {
        role: "assistant",
        content: "抱歉，获取回复时出现错误",
        isLoading: false,
      };
    } finally {
      isSenderloading.value = false;
    }
  }
};

onMounted(() => {
  const route = useRoute();
  if (route.query.agentKey) {
    selectedAgent.value = route.query.agentKey;
  }
  FetchAgentList();
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

.default-sender {
  width: 100%;
  max-width: 1100px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.active-sender {
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
  padding: 20px;
  height: calc(100vh - 300px);
  overflow-y: auto;
  margin-bottom: 90px;
}
</style>