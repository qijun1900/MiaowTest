import Home from "@/views/Home/Home.vue"
import Center from "@/views/Center/Center.vue"
import Users  from "@/views/Users/Users.vue"    
import Announcement from "@/views/News/Announcement.vue"
import NotFound from "@/views/NotFound/NotFound.vue"
import ExamManage from "@/views/Exam/ExamManage.vue"
import QuestiontManage from "@/views/Exam/QuestiontManage.vue"
import QuestionAdd from "@/views/Exam/QuestionAdd.vue"


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
    }

]
export default routes