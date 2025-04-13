<template>
    <div>
        <el-page-header content="创建信息" icon="" title="信息管理"></el-page-header>
        <el-form
            ref="newsFormRef"
            :model="newsForm"
            :rules="newsFormrules"
            label-width="auto"
            class="demo-ruleForm">
                <el-form-item 
                    label="标题" 
                    prop="title">
                    <el-input v-model="newsForm.tittle" />
                </el-form-item>
                <el-form-item 
                    label="内容" 
                    prop="content">
                    <editor @event="handlechange"/>
                </el-form-item>
                <el-form-item 
                    label="类别" 
                    prop="category">
                        <el-select
                            v-model="newsForm.category"
                            placeholder="Select">
                            <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"/>
                        </el-select>
                </el-form-item>
                <el-form-item 
                    label="封面" 
                    prop="cover">
                    <Upload 
                    :avatar='newsForm.cover'
                    @AvatarChange="handleChange"/> 
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" 
                    @click="submitForm" 
                    class="login-button">
                    添加信息
                    </el-button>
                </el-form-item>
        </el-form> 
    </div>
</template>
<script setup>
import { ref,reactive } from 'vue';
import editor from '@/components/editor/Editor.vue'
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload'
import { useRouter } from 'vue-router';

const router = useRouter()
const newsFormRef = ref()
const newsForm  = reactive({
    tittle:"",
    content:"",
    category:1,//1:最新动态，2典型案例，3通知公告
    cover:"",
    file:null,
    isPublish:0//0:未发布，1：发布
})
const newsFormrules = reactive({
    tittle:[
        {
        required: true,
        message: '请输入标题', 
        trigger: 'blur'
        }
    ],
    content:[
        {
        required: true,
        message: '请输入内容', 
        trigger: 'blur'      
        }
    ],
    category:[
        {
        required: true,
        message: '请选择分类', 
        trigger: 'blur'      
        }
    ],
    cover:[
        {
        required: true,
        message: '请选择图片', 
        trigger: 'blur'      
        }
    ],

})
//editor内容改变的回调
const handlechange = (data)=>{
    //console.log(data)
    newsForm.content = data
}
//类别选择字段
const options = [
    {
        label:'xxx01',
        value:1
    },
    {
        label:'xxx02',
        value:2
    },
    {
        label:'xxx03',
        value:3
    },
]
const handleChange = (file)=>{
    newsForm.cover = URL.createObjectURL(file)
    newsForm.file = file
}
const submitForm = ()=>{
    newsFormRef.value.validate(async(valid)=>{
        if(valid){
            console.log(newsForm)
            await upload("/adminapi/news/add",newsForm)
            router.push('/new/newslist')
        }
    })
}

</script>
<style scoped lang="scss">
.demo-ruleForm{
    margin-top: 40px;
}

</style>

