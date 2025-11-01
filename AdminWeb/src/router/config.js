import Home from "@/views/Home/Home.vue"
import Center from "@/views/Center/Center.vue"
import Users  from "@/views/Users/Users.vue"    
import Announcement from "@/views/News/Announcement.vue"
import NotFound from "@/views/NotFound/NotFound.vue"
import ExamManage from "@/views/Exam/ExamManage.vue"
import QuestiontManage from "@/views/Exam/QuestiontManage.vue"
import QuestionAdd from "@/views/Exam/QuestionSingleAdd.vue"
import ModelManage from "@/views/LLM/ModelManage.vue"
import QuestionTypeManage from "@/views/Exam/QuestionTypeManage.vue"
import QuestionBatchAdd from "@/views/Exam/QuestionBatchAdd.vue"
import LLMChat from "@/views/Chat/LLMChat.vue"
import consumerMessage from "../views/Consumer/ConsumerMessage.vue"
import ConsumerManage from "@/views/Users/Consumer.vue"

const routes= [
    {
        path:'/' ,
        redirect:'index'
    },
    {
        path: '/index',
        component: Home,
    },
    {
        path: '/center',
        component: Center,
    } ,
    {
        path: '/users',
        component: Users,
    },
    {
        path: '/news/announcement',
        component: Announcement,
    },
    {
        path:'/:patchMatch(.*)*',
        name:"NotFound",
        component:NotFound
    },
    {
        path: '/exam/exammanage',
        name: 'ExamManage',
        component: ExamManage,
    },
    {
        path: '/exam/questionlist/:id',
        name: 'QuestionManage',
        component: QuestiontManage,
    },
    {
        path: '/exam/questionadd/:id',
        name: 'QuestionAdd',
        component: QuestionAdd,
    },
    {
        path: '/exam/batchadd/:id',
        name: 'BatchAddQuestion',
        component: QuestionBatchAdd,
    },
    {
        path: '/model/modelmanage',
        name: 'ModelManage',
        component: ModelManage,
    },
    {
        path: '/exam/createExamType/:id',
        name: 'QuestionTypeManage',
        component: QuestionTypeManage,  
    },
    {
        path: '/model/chat',
        name: 'LLMChat',
        component: LLMChat,
    },
    {
        path: '/consumer/message',
        name: 'consumerMessage',
        component: consumerMessage,
    },
    {
        path: '/consumer',
        name: 'ConsumerManage',
        component: ConsumerManage,
    }

]
export default routes