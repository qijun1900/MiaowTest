import Home from "@/views/Home/Home.vue";
import Center from "@/views/Center/Center.vue";
import Users from "@/views/Users/Users.vue";
import Announcement from "@/views/News/Announcement.vue";
import NotFound from "@/views/NotFound/NotFound.vue";
import ExamManage from "@/views/Exam/ExamManage.vue";
import QuestiontManage from "@/views/Exam/QuestiontManage.vue";
import QuestionAdd from "@/views/Exam/QuestionSingleAdd.vue";
import AgentManage from "@/views/LLM/AgentManage.vue";
import QuestionTypeManage from "@/views/Exam/QuestionTypeManage.vue";
import QuestionBatchAdd from "@/views/Exam/QuestionBatchAdd.vue";
import AgentChat from "@/views/Chat/AgentChat.vue";
import consumerMessage from "../views/Consumer/ConsumerMessage.vue";
import ConsumerManage from "@/views/Users/Consumer.vue";
import ExamFileManage from "@/views/Exam/ExamFileManage.vue";
import FileList from "@/views/Resource/FileList.vue";
import FileUpload from "@/views/Resource/FileUpload.vue";
import AppVersionManage from "@/views/System/AppVersionManage.vue";
import KnowledgeManage from "@/views/Knowledge/KnowledgeManage.vue";
import KnowledgeBaseManage from "@/views/Knowledge/KnowledgeBaseManage.vue";
import RAGTest from "@/views/Knowledge/RAGTest.vue";

const routes = [
  {
    path: "/",
    redirect: "index",
  },
  {
    path: "/index",
    component: Home,
  },
  {
    path: "/center",
    component: Center,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/news/announcement",
    component: Announcement,
  },
  {
    path: "/:patchMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
  {
    path: "/exam/exammanage",
    name: "ExamManage",
    component: ExamManage,
  },
  {
    path: "/exam/questionlist/:id",
    name: "QuestionManage",
    component: QuestiontManage,
  },
  {
    path: "/exam/questionadd/:id",
    name: "QuestionAdd",
    component: QuestionAdd,
  },
  {
    path: "/exam/batchadd/:id",
    name: "BatchAddQuestion",
    component: QuestionBatchAdd,
  },
  {
    path: "/agent/agentmanage",
    name: "AgentManage",
    component: AgentManage,
  },
  {
    path: "/exam/createExamType/:id",
    name: "QuestionTypeManage",
    component: QuestionTypeManage,
  },
  {
    path: "/agent/chat",
    name: "AgentChat",
    component: AgentChat,
  },
  {
    path: "/consumer/message",
    name: "consumerMessage",
    component: consumerMessage,
  },
  {
    path: "/consumer",
    name: "ConsumerManage",
    component: ConsumerManage,
  },
  {
    path: "/exam/examfilemanage/:id",
    name: "ExamFileManage",
    component: ExamFileManage,
  },
  {
    path: "/resource/filelist",
    name: "FileList",
    component: FileList,
  },
  {
    path: "/resource/fileupload",
    name: "FileUpload",
    component: FileUpload,
  },
  {
    path: "/system/appversion",
    name: "AppVersionManage",
    component: AppVersionManage,
  },
  {
    path: "/knowledge/manage",
    name: "KnowledgeManage",
    component: KnowledgeManage,
  },
  {
    path: "/knowledge/base",
    name: "KnowledgeBaseManage",
    component: KnowledgeBaseManage,
  },
  {
    path: "/knowledge/ragtest",
    name: "RAGTest",
    component: RAGTest,
  },
];
export default routes;
