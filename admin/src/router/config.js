import Home from '../views/Home/home.vue'
import Center from '../views/Center/center.vue'
import Useradd from '../views/Users/useradd.vue'
import Userlist from '../views/Users/userlist.vue'
import Newsadd from '../views/News/newsadd.vue'
import Newslist from '../views/News/newslist.vue'
import Productadd from '../views/Products/productadd.vue'
import Productlist from '../views/Products/productlist.vue'
import NotFound from '../views/NotFound/NotFound.vue'
import  NewsEdit from '../views/News/NewsEdit.vue'
import  ProductEdit from "../views/Products/editproduct.vue"
import  Examadd from "../views/Exam/examadd.vue"
import  Examlist from "../views/Exam/examlist.vue"
import  ExamDetail from "../views/Exam/examdetail.vue"
import QuestionPnael from "../components/Exam/QuestionPnael.vue"
import Selectquestion from '../components/Exam/SelectQu.vue'
import Blankquestion from '../components/Exam/BlankQu.vue'
import Judgequestion from '../components/Exam/JudgeQu.vue'
import Shortquestion from '../components/Exam/ShortQu.vue'
import Otherquestion from '../components/Exam/OtherQu.vue'
import QuestionList from '@/components/Exam/QuestionList.vue'
import QuestionEdit from '@/components/Exam/QuestionEdit.vue'

const routes = [
    {
        path:'/index',
        component:Home,
    },
    {
        path:'/center',
        component:Center,
    },
    {
        path:'/user/adduser',
        component:Useradd,
        requireAdmin:true,
    },
    {
        path:'/user/userlist',
        component:Userlist,
        requireAdmin:true,
    },
    {
        path:'/new/addnews',
        component:Newsadd,
    },
    {
        path:'/new/newslist',
        component:Newslist,
    },
    {
        path:'/product/productadd',
        component:Productadd,
    },
    {
        path:'/product/productlist',
        component:Productlist,
    },
    {
        path:'/' ,
        redirect:'index'
    },
    {
        path:'/:patchMatch(.*)*',
        name:"NotFound",
        component:NotFound
    },
    {
        path:'/news/editnews/:id',
        component:NewsEdit,
    },
    {
        path:'/product/editproduct/:id',
        component:ProductEdit,
    },
    {
        path:'/exam/addexam',
        component:Examadd,
    },
    {
        path:'/exam/examlist',
        component:Examlist,
    },
    {
       path:'/exam/editexam/:id', 
       component:ExamDetail,    
    },
    {
        path:'/exam/questionpnael/:id', 
        component:QuestionPnael,    
     },
     {
        path:'/exam/selectquestion/:id',
        component:Selectquestion,
     },
     {
        path:'/exam/blankquestion/:id',
        component:Blankquestion, 
     },
     {
        path:'/exam/judgequestion/:id',
        component:Judgequestion,
     },
     {
        path:'/exam/shortquestion/:id',
        component:Shortquestion,
     },
     {
        path:'/exam/otherquestion/:id',
        component:Otherquestion,
     },
     {
        path:'/exam/questionlist/:id',
        component:QuestionList,
     },
     {
        path: '/exam/:id/edit/:questionId',
        component: QuestionEdit,
        props: true
      }




]
export default routes