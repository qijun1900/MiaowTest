import Home from "@/views/Home/Home.vue"
import Center from "@/views/Center/Center.vue"
import Users  from "@/views/Users/Users.vue"    
import Announcement from "@/views/News/Announcement.vue"
import NotFound from "@/views/NotFound/NotFound.vue"
import ExamManage from "@/views/Exam/ExamManage.vue"

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
    }

]
export default routes