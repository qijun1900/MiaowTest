<template>
  <div class="container">
    <XWelcome
      v-show="!isSendValue"
      title="欢迎使用AI智能录题，可向该科目题类型下添加大量题目！"
      description="大模型智能体应用，使用自然语言输入即可识别题目类型与结构化输出，实现题目自动处理与添加"
    >
      <template #welcomeExtra>
        <QuestionDisplay />
      </template>
    </XWelcome>
    <div :class="isSendValue ? 'active-sender' : 'default-sender'">
      <XEditorSender
        ref="editorRef"
        @user-submit="handleUserSend"
        placeholder="请在此处输入题目内容~"
        :isShowHeaderFlog="true"
        :iSshowPrefixFlog="true"
        :iSclearable="true"
        :isSenderloading="isSenderloading"
        HeaderLeftTitle="💯当前科目及其题目信息~"
        HeaderSelfWrapclassName="my-header-self-wrap"
        HeaderSelfContentclassName="my-header-self-content"
      >
        <template #sender-prefix>
          <el-button color="#626aef" :dark="true" @click="openCloseHeader">
            打开/关闭头部
          </el-button>
        </template>
        <template #HeaderSelfContent>
          <el-card style="border-radius: 10px" shadow="never">
            <el-descriptions :column="4">
              <el-descriptions-item label="科目名称">
                <el-tag type="success">{{ appStore.examInfo.name }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="题目类别">
                <el-tag type="warning">{{ getCategoryName(appStore.examInfo.category) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="题目数量">
                <el-tag type="primary">{{ appStore.currentQuestionTotal }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                <el-tag type="info">{{
                  formatTime.getTime2(appStore.examInfo.createdTime)
                }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
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
          :typingsteps="message.role === 'user' ? 0 : 4"
          :typinginterval="message.role === 'user' ? 0 : 30"
          :typingsuffix="message.role === 'user' ? '' : '💩'"
          :isFog="true"
        />
      </div>
      <div v-if="response && response.data && response.data.data.length > 0">
        <el-card style="border-radius: 10px; width: 650px">
          <el-table
            :data="response.data.data"
            style="width: 600px"
            v-loading="tableLoading"
            element-loading-text="加载中..."
          >
            <el-table-column type="index" label="序号" width="70" :index="(index) => index + 1" />
            <el-table-column label="题目题干" width="250">
              <template #default="scope">
                <div v-html="scope.row.stem"></div>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" width="180">
              <template #default="scope">
                <template v-if="scope.row.Type === 1">
                  <el-tag type="success">{{ formatSelectAnswer(scope.row.options) }}</el-tag>
                </template>
                <template v-else-if="scope.row.Type === 2">
                  <div v-for="(option, index) in scope.row.options" :key="index">
                    <el-tag class="blank-tag">空{{ index + 1 }}</el-tag>
                    <span class="blank-content">{{ option.content }}</span>
                  </div>
                </template>
                <template v-else-if="scope.row.Type === 3">
                  <el-tag :type="scope.row.answer == 1 ? 'success' : 'danger'">
                    {{ scope.row.answer === 1 ? "正确" : "错误" }}
                  </el-tag>
                </template>
                <template v-else-if="scope.row.Type === 4">
                  <el-tag type="info" @click="handleLooked(scope.row.content)">查看答案</el-tag>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="success" plain @click="handlePreview(scope.row)"> 预览 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
    <QuestionPreview v-model="PreviewdialogVisible" :Data="QuestionData" />
  </div>
</template>
<script setup>
import XEditorSender from "@/components/Element-plus-x/XEditorSender .vue";
import { useAppStore } from "@/stores";
import { getCategoryName } from "@/util/formatExamname";
import formatTime from "@/util/formatTime";
import { ref, defineAsyncComponent } from "vue";
import XWelcome from "@/components/Element-plus-x/XWelcome.vue";
import XBubble from "@/components/Element-plus-x/XBubble.vue";
import { modelappBatchaddQuestion } from "@/API/LLM/modelappAPI";
import escconfig from "../../config/esc.config";
import { useRoute } from "vue-router";
import QuestionDisplay from "@/components/Exam/QuestionDisplay.vue";
import { formatSelectAnswer } from "@/util/formatAnswer";
import handleLooked from "@/util/CheckInfo";

// 动态导入较大的组件
const QuestionPreview = defineAsyncComponent(() => import("@/components/Exam/QuestionPreview.vue"));

const appStore = useAppStore();
const isSendValue = ref(false); // 是否发送消息
const chatHistory = ref([]); // 聊天记录
const isLoading = ref(false); // 发送按钮加载中状态
const editorRef = ref(); // 编辑器引用
const isSenderloading = ref(false); // 发送按钮加载中状态Sender
const route = useRoute();
const QuestionType = appStore.examInfo.category; // 题目类型
const QuestionData = ref(null); // 题目数据
const PreviewdialogVisible = ref(false); // 预览对话框
// 表格加载状态
const tableLoading = ref(false);

// 提交方法
const response = ref(null);
const handleUserSend = async (data) => {
  if (data) {
    // 添加用户消息
    chatHistory.value.push({ role: "user", content: data.text });
    isSenderloading.value = true; // 开始加载
    editorRef.value?.clearContent(); // 清空编辑器内容
    isSendValue.value = true;

    // 立即添加一个 loading 状态的 AI 消息
    chatHistory.value.push({
      role: "题目添加AI助手",
      content: "正在思考中...",
      isLoading: true,
    });

    //  AI 回复的过程
    isLoading.value = true;
    tableLoading.value = true;
    try {
      response.value = await modelappBatchaddQuestion(
        chatHistory.value,
        route.params.id,
        QuestionType,
      );
      if (response.value.code === 200) {
        // 成功获取 AI 回复后更新消息
        chatHistory.value[chatHistory.value.length - 1] = {
          // 直接修改最后一个消息
          role: "题目添加AI助手",
          content: response.value.data.message + `(插入数量为：${response.value.data.count})`,
          isLoading: false,
        };
      }
    } catch (error) {
      console.error("获取 AI 回复失败:", error);
      // 发生错误时更新消息
      chatHistory.value[chatHistory.value.length - 1] = {
        role: "assistant",
        content: "抱歉，获取回复时出现错误",
        isLoading: false,
      };
    } finally {
      isSenderloading.value = false; // 结束加载
      tableLoading.value = false; // 结束表格加载
    }
  }
};
// 打开头部方法
const openCloseHeader = () => {
  editorRef.value.openCloseHeader();
};
//预览
const handlePreview = (row) => {
  PreviewdialogVisible.value = true;
  QuestionData.value = row;
};
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
  margin: 20px auto;
  padding: 20px;
  height: calc(100vh - 300px);
  overflow-y: auto;
  margin-bottom: 90px;
}
</style>
