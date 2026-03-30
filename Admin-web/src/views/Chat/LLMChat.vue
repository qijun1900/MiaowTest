<template>
  <div class="container">
    <XWelcome
      v-show="!isSendValue"
      title="欢迎使用AI对话~！"
      :extra="`当前对话模型：${selectedModel || 'qwen-plus'}`"
      :description="
        modelOptions.find((option) => option.value === selectedModel)?.description || ''
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
            placeholder="选择模型"
            v-model="selectedModel"
            :options="modelOptions"
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
              ? `http://${escconfig.serverHost}:${escconfig.serverPort}` + appStore.userInfo.avatar
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
import XEditorSender from "@/components/Element-plus-x/XEditorSender .vue";
import { useAppStore } from "@/stores";
import { onMounted, ref } from "vue";
import XWelcome from "@/components/Element-plus-x/XWelcome.vue";
import XBubble from "@/components/Element-plus-x/XBubble.vue";
import { testChatAPI, getChatModels } from "@/API/LLM/chatAPI";
import ElSelect from "@/components/ReuseComponents/ElSelect.vue";
import { useRoute } from "vue-router";
import escconfig from "../../config/esc.config";

const appStore = useAppStore(); // Pinia应用状态管理
const isSendValue = ref(false); // 是否发送消息
const chatHistory = ref([]); // 聊天记录
const editorRef = ref(); // 编辑器引用
const isSenderloading = ref(false); // 发送按钮加载中状态Sender
const selectedModel = ref(""); // 选择的模型value
const modelOptions = ref([]); // 模型选项,列表

// 获取模型列表
const FetchModeList = async () => {
  try {
    const response = await getChatModels();
    if (response.code === 200) {
      modelOptions.value = response.data.map((item) => ({
        value: item.modelValue,
        label: item.modelName,
        description: item.description,
      }));
    }
  } catch (error) {
    console.error("Error fetching chat models:", error);
  }
};
// 处理用户发送消息
const handleUserSend = async (data) => {
  if (data) {
    chatHistory.value.push({ role: "user", content: data.text });
    isSenderloading.value = true; // 开始加载
    editorRef.value?.clearContent(); // 清空编辑器内容
    isSendValue.value = true;

    chatHistory.value.push({
      role: "AI助手",
      content: "正在思考中...",
      isLoading: true,
    });

    try {
      const response = await testChatAPI(
        chatHistory.value,
        selectedModel.value ? selectedModel.value : "qwen-plus",
      );
      if (response.code === 200) {
        chatHistory.value[chatHistory.value.length - 1] = {
          role: response.data.modelName,
          content: response.data.Aidata,
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
      isSenderloading.value = false; // 结束加载
    }
  }
};

onMounted(() => {
  const route = useRoute();
  if (route.query.modelValue) {
    selectedModel.value = route.query.modelValue;
  }
  FetchModeList();
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
